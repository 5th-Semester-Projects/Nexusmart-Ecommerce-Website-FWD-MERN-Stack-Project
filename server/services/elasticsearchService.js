import { Client } from '@elastic/elasticsearch';

class ElasticsearchService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.indices = {
      products: 'nexusmart_products',
      users: 'nexusmart_users',
      orders: 'nexusmart_orders',
      searchLogs: 'nexusmart_search_logs'
    };
  }

  // Initialize connection
  async connect() {
    try {
      this.client = new Client({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Test connection
      const health = await this.client.cluster.health();
      console.log('✅ Elasticsearch Connected:', health.status);
      this.isConnected = true;

      // Create indices if not exist
      await this.setupIndices();
    } catch (error) {
      console.error('❌ Elasticsearch Connection Failed:', error.message);
      this.isConnected = false;
    }
  }

  // Setup indices with mappings
  async setupIndices() {
    try {
      // Products index
      const productsExists = await this.client.indices.exists({ index: this.indices.products });
      if (!productsExists) {
        await this.client.indices.create({
          index: this.indices.products,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              analysis: {
                analyzer: {
                  product_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'snowball', 'word_delimiter_graph']
                  },
                  autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'autocomplete_filter']
                  }
                },
                filter: {
                  autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 20
                  }
                }
              }
            },
            mappings: {
              properties: {
                name: {
                  type: 'text',
                  analyzer: 'product_analyzer',
                  fields: {
                    autocomplete: {
                      type: 'text',
                      analyzer: 'autocomplete'
                    },
                    keyword: {
                      type: 'keyword'
                    }
                  }
                },
                description: {
                  type: 'text',
                  analyzer: 'product_analyzer'
                },
                category: {
                  type: 'keyword'
                },
                brand: {
                  type: 'keyword'
                },
                price: {
                  type: 'float'
                },
                originalPrice: {
                  type: 'float'
                },
                discount: {
                  type: 'integer'
                },
                rating: {
                  type: 'float'
                },
                numReviews: {
                  type: 'integer'
                },
                stock: {
                  type: 'integer'
                },
                tags: {
                  type: 'keyword'
                },
                attributes: {
                  type: 'object'
                },
                images: {
                  type: 'object',
                  enabled: false
                },
                seller: {
                  type: 'keyword'
                },
                createdAt: {
                  type: 'date'
                },
                updatedAt: {
                  type: 'date'
                },
                views: {
                  type: 'integer'
                },
                sales: {
                  type: 'integer'
                },
                suggest: {
                  type: 'completion',
                  contexts: [
                    {
                      name: 'category',
                      type: 'category'
                    }
                  ]
                }
              }
            }
          }
        });
        console.log('✅ Products index created');
      }

      // Search logs index for analytics
      const logsExists = await this.client.indices.exists({ index: this.indices.searchLogs });
      if (!logsExists) {
        await this.client.indices.create({
          index: this.indices.searchLogs,
          body: {
            mappings: {
              properties: {
                query: { type: 'text' },
                userId: { type: 'keyword' },
                sessionId: { type: 'keyword' },
                resultsCount: { type: 'integer' },
                clickedProduct: { type: 'keyword' },
                timestamp: { type: 'date' },
                filters: { type: 'object' }
              }
            }
          }
        });
        console.log('✅ Search logs index created');
      }
    } catch (error) {
      console.error('Error setting up indices:', error);
    }
  }

  // Index a product
  async indexProduct(product) {
    if (!this.isConnected) return false;

    try {
      await this.client.index({
        index: this.indices.products,
        id: product._id.toString(),
        body: {
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating || 0,
          numReviews: product.numReviews || 0,
          stock: product.stock,
          tags: product.tags || [],
          attributes: product.attributes || {},
          images: product.images,
          seller: product.seller?.toString(),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          views: product.views || 0,
          sales: product.sales || 0,
          suggest: {
            input: [product.name, ...(product.tags || [])],
            contexts: {
              category: [product.category]
            }
          }
        },
        refresh: true
      });
      return true;
    } catch (error) {
      console.error('Error indexing product:', error);
      return false;
    }
  }

  // Bulk index products
  async bulkIndexProducts(products) {
    if (!this.isConnected || !products.length) return false;

    try {
      const operations = products.flatMap(product => [
        { index: { _index: this.indices.products, _id: product._id.toString() } },
        {
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: product.price,
          rating: product.rating || 0,
          stock: product.stock,
          tags: product.tags || [],
          images: product.images,
          createdAt: product.createdAt
        }
      ]);

      const { body: result } = await this.client.bulk({
        refresh: true,
        operations
      });

      return !result.errors;
    } catch (error) {
      console.error('Error bulk indexing:', error);
      return false;
    }
  }

  // Advanced search
  async search(query, options = {}) {
    if (!this.isConnected) return { products: [], total: 0 };

    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      minRating,
      brand,
      inStock,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    try {
      const must = [];
      const filter = [];
      const should = [];

      // Main query
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['name^3', 'name.autocomplete^2', 'description', 'brand^2', 'tags^1.5'],
            type: 'best_fields',
            fuzziness: 'AUTO',
            prefix_length: 2
          }
        });

        // Boost exact matches
        should.push({
          match_phrase: {
            name: {
              query,
              boost: 5
            }
          }
        });
      }

      // Filters
      if (category) {
        filter.push({ term: { category } });
      }

      if (brand) {
        filter.push({ term: { brand } });
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        const range = { price: {} };
        if (minPrice !== undefined) range.price.gte = minPrice;
        if (maxPrice !== undefined) range.price.lte = maxPrice;
        filter.push({ range });
      }

      if (minRating) {
        filter.push({ range: { rating: { gte: minRating } } });
      }

      if (inStock) {
        filter.push({ range: { stock: { gt: 0 } } });
      }

      // Sorting
      const sort = [];
      switch (sortBy) {
        case 'price':
          sort.push({ price: sortOrder });
          break;
        case 'rating':
          sort.push({ rating: 'desc' });
          break;
        case 'newest':
          sort.push({ createdAt: 'desc' });
          break;
        case 'popular':
          sort.push({ sales: 'desc' }, { views: 'desc' });
          break;
        case 'relevance':
        default:
          sort.push({ _score: 'desc' });
      }

      const response = await this.client.search({
        index: this.indices.products,
        body: {
          from: (page - 1) * limit,
          size: limit,
          query: {
            bool: {
              must: must.length ? must : [{ match_all: {} }],
              should,
              filter
            }
          },
          sort,
          highlight: {
            fields: {
              name: {},
              description: { fragment_size: 150 }
            },
            pre_tags: ['<mark>'],
            post_tags: ['</mark>']
          },
          aggs: {
            categories: {
              terms: { field: 'category', size: 20 }
            },
            brands: {
              terms: { field: 'brand', size: 20 }
            },
            price_ranges: {
              range: {
                field: 'price',
                ranges: [
                  { to: 50, key: 'Under $50' },
                  { from: 50, to: 100, key: '$50 - $100' },
                  { from: 100, to: 500, key: '$100 - $500' },
                  { from: 500, key: 'Over $500' }
                ]
              }
            },
            avg_price: {
              avg: { field: 'price' }
            },
            avg_rating: {
              avg: { field: 'rating' }
            }
          }
        }
      });

      const products = response.hits.hits.map(hit => ({
        _id: hit._id,
        ...hit._source,
        score: hit._score,
        highlights: hit.highlight
      }));

      return {
        products,
        total: response.hits.total.value,
        aggregations: {
          categories: response.aggregations.categories.buckets,
          brands: response.aggregations.brands.buckets,
          priceRanges: response.aggregations.price_ranges.buckets,
          avgPrice: response.aggregations.avg_price.value,
          avgRating: response.aggregations.avg_rating.value
        },
        page,
        pages: Math.ceil(response.hits.total.value / limit)
      };
    } catch (error) {
      console.error('Search error:', error);
      return { products: [], total: 0 };
    }
  }

  // Autocomplete suggestions
  async autocomplete(prefix, options = {}) {
    if (!this.isConnected) return [];

    const { category, limit = 10 } = options;

    try {
      const response = await this.client.search({
        index: this.indices.products,
        body: {
          suggest: {
            product_suggestions: {
              prefix,
              completion: {
                field: 'suggest',
                size: limit,
                skip_duplicates: true,
                fuzzy: {
                  fuzziness: 'AUTO'
                },
                contexts: category ? {
                  category: [category]
                } : undefined
              }
            }
          }
        }
      });

      return response.suggest.product_suggestions[0].options.map(option => ({
        text: option.text,
        score: option._score,
        id: option._id,
        category: option._source?.category
      }));
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  // Similar products (More Like This)
  async findSimilar(productId, limit = 10) {
    if (!this.isConnected) return [];

    try {
      const response = await this.client.search({
        index: this.indices.products,
        body: {
          size: limit,
          query: {
            more_like_this: {
              fields: ['name', 'description', 'category', 'tags'],
              like: [
                {
                  _index: this.indices.products,
                  _id: productId
                }
              ],
              min_term_freq: 1,
              min_doc_freq: 1,
              max_query_terms: 12
            }
          }
        }
      });

      return response.hits.hits.map(hit => ({
        _id: hit._id,
        ...hit._source,
        similarity: hit._score
      }));
    } catch (error) {
      console.error('Similar products error:', error);
      return [];
    }
  }

  // Log search query for analytics
  async logSearch(data) {
    if (!this.isConnected) return;

    try {
      await this.client.index({
        index: this.indices.searchLogs,
        body: {
          ...data,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  // Get trending searches
  async getTrendingSearches(limit = 10) {
    if (!this.isConnected) return [];

    try {
      const response = await this.client.search({
        index: this.indices.searchLogs,
        body: {
          size: 0,
          query: {
            range: {
              timestamp: {
                gte: 'now-24h'
              }
            }
          },
          aggs: {
            trending: {
              terms: {
                field: 'query.keyword',
                size: limit
              }
            }
          }
        }
      });

      return response.aggregations.trending.buckets.map(b => ({
        query: b.key,
        count: b.doc_count
      }));
    } catch (error) {
      console.error('Trending searches error:', error);
      return [];
    }
  }

  // Delete product from index
  async deleteProduct(productId) {
    if (!this.isConnected) return false;

    try {
      await this.client.delete({
        index: this.indices.products,
        id: productId,
        refresh: true
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) return { status: 'disconnected' };

    try {
      const health = await this.client.cluster.health();
      const stats = await this.client.indices.stats({ index: this.indices.products });

      return {
        status: health.status,
        numberOfNodes: health.number_of_nodes,
        activeShards: health.active_shards,
        productsCount: stats.indices[this.indices.products]?.total?.docs?.count || 0
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

const elasticsearchService = new ElasticsearchService();
export default elasticsearchService;
