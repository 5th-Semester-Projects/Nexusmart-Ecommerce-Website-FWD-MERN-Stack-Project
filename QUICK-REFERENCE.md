# 🚀 Quick Reference - API & Components

## 📦 Common Imports

```javascript
// Components
import { Button, Input, Loader, Modal } from '@/components/common'
import { ProductGrid, ProductCard, ProductFilters } from '@/components/products'

// Redux
import { useDispatch, useSelector } from 'react-redux'

// API
import { productsAPI, cartAPI, authAPI, ordersAPI } from '@/utils/api'

// Redux Actions
import { fetchProducts } from '@/redux/slices/productSlice'
import { addItemToCart } from '@/redux/slices/cartSlice'
import { login, register } from '@/redux/slices/authSlice'
```

---

## 🔘 Button Component

```jsx
// Basic
<Button>Click Me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading={true}>Loading...</Button>
<Button disabled>Disabled</Button>

// With Icon
<Button icon={FiUser} iconPosition="left">Profile</Button>

// Full Width
<Button fullWidth>Full Width</Button>
```

---

## 📝 Input Component

```jsx
// Basic
<Input label="Email" type="email" />

// With Icon
<Input label="Email" icon={FiMail} />

// With Error
<Input
  label="Email"
  error="Invalid email"
  helperText="Enter a valid email address"
/>

// With React Hook Form
<Input
  label="Email"
  {...register('email', { required: true })}
  error={errors.email?.message}
/>

// Required
<Input label="Name" required />
```

---

## 🎨 Loader Components

```jsx
// Spinner
<Spinner size="md" />

// Page Loader
<PageLoader />

// Dots Loader
<DotsLoader />

// Skeleton
<Skeleton variant="text" />
<Skeleton variant="title" />
<Skeleton variant="circle" />
<Skeleton variant="rect" />

// Product Card Skeleton
<ProductCardSkeleton />
```

---

## 🛍️ Product Components

```jsx
// Product Grid
<ProductGrid
  products={products}
  loading={loading}
  onQuickView={handleQuickView}
/>

// Product Card
<ProductCard
  product={product}
  onQuickView={handleQuickView}
/>

// Product Filters
<ProductFilters
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearFilters={handleClearFilters}
  categories={categories}
/>
```

---

## 🔄 Redux Usage

### Fetch Products

```javascript
const dispatch = useDispatch()
const { products, loading } = useSelector((state) => state.products)

useEffect(() => {
  dispatch(
    fetchProducts({
      category: 'electronics',
      minPrice: 100,
      maxPrice: 1000,
      limit: 12,
    })
  )
}, [dispatch])
```

### Add to Cart

```javascript
const handleAddToCart = (product) => {
  dispatch(
    addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity: 1,
    })
  )
  toast.success('Added to cart!')
}
```

### Authentication

```javascript
const handleLogin = async (credentials) => {
  try {
    await dispatch(login(credentials)).unwrap()
    navigate('/dashboard')
  } catch (error) {
    toast.error(error)
  }
}
```

### Update Filters

```javascript
dispatch(
  setFilters({
    category: 'electronics',
    minPrice: 100,
  })
)
```

---

## 🌐 Direct API Calls

### Products

```javascript
// Get all products
const response = await productsAPI.getAll({ category: 'electronics' })

// Get single product
const product = await productsAPI.getById(productId)

// Search products
const results = await productsAPI.search('laptop')

// Get trending
const trending = await productsAPI.getTrending()
```

### Cart

```javascript
// Get cart
const cart = await cartAPI.get()

// Add to cart
await cartAPI.add({ productId, quantity: 1 })

// Update quantity
await cartAPI.update(itemId, 2)

// Remove item
await cartAPI.remove(itemId)
```

### Authentication

```javascript
// Register
await authAPI.register({ name, email, password })

// Login
await authAPI.login({ email, password })

// Get current user
const user = await authAPI.getCurrentUser()

// Update profile
await authAPI.updateProfile(userData)
```

### Orders

```javascript
// Create order
const order = await ordersAPI.create(orderData)

// Get all orders
const orders = await ordersAPI.getAll()

// Get single order
const order = await ordersAPI.getById(orderId)
```

---

## 🎯 Common Patterns

### Loading State

```javascript
const [loading, setLoading] = useState(false)

const fetchData = async () => {
  setLoading(true)
  try {
    const data = await productsAPI.getAll()
    // Handle data
  } catch (error) {
    toast.error('Failed to fetch')
  } finally {
    setLoading(false)
  }
}
```

### Error Handling

```javascript
try {
  await dispatch(someAction()).unwrap()
  toast.success('Success!')
} catch (error) {
  toast.error(error || 'Something went wrong')
}
```

### Form Submission

```javascript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm()

const onSubmit = async (data) => {
  try {
    await someAPI.create(data)
    toast.success('Created successfully!')
  } catch (error) {
    toast.error('Failed to create')
  }
}

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <Input
      label="Name"
      {...register('name', { required: 'Name is required' })}
      error={errors.name?.message}
    />
    <Button type="submit">Submit</Button>
  </form>
)
```

---

## 🔐 Authentication Token

Token is automatically handled by the API utility:

```javascript
// No need to manually add headers!
// This is handled automatically by the interceptor

// Old way (DON'T DO THIS)
const response = await axios.get('/api/products', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

// New way (CORRECT)
const response = await productsAPI.getAll()
```

---

## 🎨 Tailwind Classes

### Common Patterns

```jsx
// Card
<div className="card p-6">Content</div>

// Container
<div className="container mx-auto px-4">Content</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flex Center
<div className="flex items-center justify-center">

// Button Base
<button className="btn btn-primary">

// Dark Mode
<div className="bg-white dark:bg-gray-900">
```

---

## 🚨 Error Handling

### API Errors

- **401** - Automatically logs out and redirects to login
- **403** - Access forbidden (check permissions)
- **404** - Resource not found
- **500** - Server error (check backend)

### Common Issues

**API calls failing?**

```javascript
// Check environment variable
console.log(import.meta.env.VITE_API_URL)
```

**Token not working?**

```javascript
// Check if token exists
console.log(localStorage.getItem('token'))
```

**Redux state not updating?**

```javascript
// Use Redux DevTools to inspect state
// Make sure dispatch is being called
```

---

## 📱 Responsive Breakpoints

```
xs: < 640px   (mobile)
sm: 640px     (small tablet)
md: 768px     (tablet)
lg: 1024px    (desktop)
xl: 1280px    (large desktop)
2xl: 1536px   (extra large)
```

Usage:

```jsx
<div className="
  text-sm sm:text-base md:text-lg lg:text-xl
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
">
```

---

## 🎯 Pro Tips

1. **Use Redux DevTools** - Install browser extension for debugging
2. **Use React DevTools** - Inspect component hierarchy
3. **Check Network Tab** - See API requests/responses
4. **Use Toast Notifications** - Provide user feedback
5. **Handle Loading States** - Always show loaders
6. **Error Boundaries** - Wrap components in ErrorBoundary
7. **Lazy Loading** - Use React.lazy for code splitting
8. **Memoization** - Use useMemo/useCallback for performance

---

## 📞 Need Help?

1. Check **INTEGRATION-GUIDE.md** for detailed documentation
2. Review **IntegrationExamples.jsx** for code examples
3. Check **ISSUES-FIXED-SUMMARY.md** for what's been fixed
4. Look at existing pages like ProductsPage.jsx for patterns
5. Use browser console for error messages
6. Check Redux DevTools for state issues

---

**Happy Coding! 🚀**
