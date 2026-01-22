
---

## Frontend `README.md` (React)

```markdown
# Shop Platform – Frontend (React SPA)

A modern React single-page application (SPA) that consumes a Laravel backend to provide a simple online shop:

- Homepage with hero section, categories, and featured products.
- Dedicated products page with grid layout.
- Product details page.
- Cart page with size and quantity management.
- “Quick add” modal that behaves like a mini product page.

---

## 1. Tech Stack

- **React** (functional components + hooks)
- **React Router** for client-side routing
- **Context API** for cart management (`CartContext`)
- **CSS** with custom styling in `App.css`

---

## 2. Main Features

### Global Layout

- Top navigation bar:
  - Brand name from environment variable (`REACT_APP_APP_NAME`)
  - Links: Home, Products, Cart
- Dark theme:
  - Black background
  - White text
  - Subtle hover animations and transitions

### Home Page

- Hero section with brand logo/image and call-to-action buttons.
- Category tiles with background images:
  - Men, Women, Unisex, Shoes, etc. (customizable)
  - Hover effects (lift + zoom on image).
- Featured products:
  - Uses same product card design as the products page.
  - “Quick add” button opens a modal.

### Products Page

- Fetch products from Laravel backend (`/api/products`).
- Display as grid of cards:
  - Product image
  - Category name
  - Product name
  - Price
  - Available sizes (from backend `sizes` array)
- “Quick add” button:
  - Opens a **QuickAddModal**:
    - Product image
    - Title
    - Category
    - Price
    - Description
    - Size dropdown (using allowed sizes from backend)
    - Quantity selector
  - On submit, calls `addToCart` from `CartContext`.

### Product Details Page

- Fetch a single product from `/api/products/:id`.
- Show:
  - Image
  - Category
  - Name, price
  - Full description
  - Available sizes dropdown
  - Quantity input
- Add to cart (using the same cart context logic).

### Cart Page

- Shows items added from both product details and Quick add modal:
  - Product name
  - Selected size
  - Quantity
  - Price and subtotal
  - Product image
- Update quantity & size.
- Remove item from cart.
- Shows total price.

---

## 3. Environment Variables

Create a `.env` file in the root of the React project:

```dotenv
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
REACT_APP_STORAGE_URL=http://127.0.0.1:8000/storage
REACT_APP_APP_NAME="Shop Platform"

---

## 4. Project Structure


shop-frontend/
├─ src/
│  ├─ components/
│  │  ├─ Navbar.js          # Top navigation bar
│  │  ├─ ProductCard.js     # Product card with "Quick add" and "Details"
│  │  └─ QuickAddModal.js   # Full mini product page in a modal
│  ├─ context/
│  │  └─ CartContext.js     # Cart state and add/update/remove logic
│  ├─ pages/
│  │  ├─ HomePage.js        # Hero, categories, featured products
│  │  ├─ ProductsPage.js    # Full products grid, integrates QuickAddModal
│  │  ├─ ProductDetailsPage.js
│  │  └─ CartPage.js
│  ├─ App.js                # Router + layout
│  ├─ App.css               # Styling (dark theme, transitions, modal)
│  └─ index.js              # Entry point
├─ public/
└─ package.json
