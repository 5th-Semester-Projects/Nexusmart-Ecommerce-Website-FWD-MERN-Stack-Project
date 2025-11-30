import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGrid,
  FiPackage,
  FiImage,
} from 'react-icons/fi';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearSuccess,
  clearError,
} from '../../redux/slices/adminSlice';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CategoryForm = ({ category, onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    slug: category?.slug || '',
    isActive: category?.isActive ?? true,
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(category?.image?.url || null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    if (image) {
      submitData.append('image', image);
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Category Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter category name"
        required
      />

      <Input
        label="Slug"
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        placeholder="category-slug"
        helperText="URL-friendly version of the name"
      />

      <div>
        <label className="block text-sm font-medium text-purple-300 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter category description"
          rows={3}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-purple-300 mb-2">
          Category Image
        </label>
        <div className="flex items-center gap-4">
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-xl border border-purple-500/30"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreviewImage(null);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 border-2 border-dashed border-purple-500/30 rounded-xl flex items-center justify-center bg-purple-500/5">
              <FiImage className="w-8 h-8 text-purple-400" />
            </div>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors">
              {previewImage ? 'Change Image' : 'Upload Image'}
            </span>
          </label>
        </div>
      </div>

      {/* Active Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-5 h-5 text-purple-600 rounded border-purple-500/30 bg-gray-800/50 focus:ring-purple-500"
        />
        <span className="text-purple-300">Category is active</span>
      </label>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-purple-500/20">
        <Button variant="outline" type="button" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading} fullWidth>
          {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, categoriesLoading, actionLoading, success, error, products } = useSelector(
    (state) => state.admin
  );
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
      setShowModal(false);
      setEditingCategory(null);
      setDeleteConfirm(null);
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleCreateCategory = (formData) => {
    dispatch(createCategory(formData));
  };

  const handleUpdateCategory = (formData) => {
    dispatch(updateCategory({ id: editingCategory._id, categoryData: formData }));
  };

  const handleDeleteCategory = () => {
    if (deleteConfirm) {
      dispatch(deleteCategory(deleteConfirm._id));
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  // Get product count for each category (if products are loaded)
  const getProductCount = (categoryId) => {
    if (!products || products.length === 0) return 0;
    return products.filter(
      (p) => p.category?._id === categoryId || p.category === categoryId
    ).length;
  };

  return (
    <>
      <Helmet>
        <title>Categories Management - NexusMart Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>Categories</h1>
            <p className="text-purple-300">
              Organize your products into categories ({categories.length} total)
            </p>
          </div>
          <Button variant="primary" icon={FiPlus} onClick={openCreateModal}>
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-300">Loading categories...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl">
            <FiGrid className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No categories yet
            </h3>
            <p className="text-purple-300 mb-4">
              Create your first category to organize products
            </p>
            <Button variant="primary" icon={FiPlus} onClick={openCreateModal}>
              Add Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden group hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
              >
                {/* Category Image */}
                <div className="h-40 bg-gradient-to-br from-purple-600 to-cyan-600 relative overflow-hidden">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiGrid className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-500/80 text-white'
                          : 'bg-gray-500/80 text-white'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-3 bg-purple-500 rounded-full text-white hover:bg-purple-400 transition-colors"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="p-3 bg-red-500 rounded-full text-white hover:bg-red-400 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-purple-300 mb-3 line-clamp-2">
                    {category.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-cyan-400">
                      <FiPackage className="w-4 h-4" />
                      {getProductCount(category._id)} Products
                    </span>
                    <span className="text-xs text-purple-400 font-mono">
                      /{category.slug}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="md"
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          isLoading={actionLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete "{deleteConfirm?.name}"?
          </h3>
          <p className="text-purple-300 mb-6">
            This will remove the category. Products in this category will be uncategorized.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} fullWidth>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="!bg-red-600 hover:!bg-red-700"
              onClick={handleDeleteCategory}
              disabled={actionLoading}
              fullWidth
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CategoriesPage;
