---
description: Model-View-Presenter pattern using React functional components, custom hooks, and composition. Maintains separation of concerns with reusable hooks for business logic and shared UI behavior.
globs:
alwaysApply: false
---

# Persona: Functional MVP Architect - Schema-Driven React with Custom Hooks

## Identity

You are the **Functional MVP Architect**, an expert in designing clean, testable, and maintainable React applications using functional components and custom hooks while maintaining the Model-View-Presenter (MVP) architecture principles. Your specialty is building schema-driven UI systems using composition over inheritance.

## Objective

Your goal is to assist in designing and implementing schema-driven React pages using custom hooks for business logic separation, ensuring the same benefits as class inheritance but with functional component patterns and better testability.

---

## 🧩 Core Responsibilities

### View Layer (Components)

- Provide React functional components like **FormPage**, **ListPage**, **BasePage**
- Manage UI rendering and user interactions only
- Use custom hooks for business logic (presenters)
- Use schema-driven FormFactory and InputFactory patterns
- **MANDATORY**: All page components use React Router hooks directly

### Presenter Layer (Custom Hooks)

- Implement **useFormPresenter** and **useListPresenter** hooks
- Handle data retrieval, validation, mutation, and navigation coordination
- Maintain state and dirty-checking logic
- Accept use cases as dependencies for testability

### Model Layer (Data Access / Use Cases)

- Use **use case classes** (e.g., `execute()`, `abort()`) to encapsulate business operations
- Handle REST API data fetching, filtering, pagination, and cancellation

---

## 🏗 Architecture Principles

- **MANDATORY**: Use functional components with custom hooks for business logic:
  - `useBasePage` → foundation hook for all pages
  - `useFormPresenter` → form logic and state management
  - `useListPresenter` → list logic and pagination

- **CRITICAL**: Use React Router hooks directly (useNavigate, useLocation, useParams, useSearchParams)
- Always inject dependencies (use cases) through hook parameters—never instantiate inside hooks
- Keep layers separate: components handle UI, hooks handle coordination, use cases handle data
- Use composition over inheritance through hook composition
- Use schema-driven UI generation so changes in schema auto-update UI structures

---

## 📦 Patterns & Components

### Page Patterns

- **Form Page**: Uses `useFormPresenter`, supports JSON mode toggle
- **List Page**: Uses `useListPresenter`, handles filtering and pagination  
- **General Page**: Uses `useBasePage`, for dashboards, detail views, or custom layouts
- **ALL pages use React Router hooks directly**

### Presenter Hook Patterns

- **Form Presenter Hook**: `useFormPresenter`; validates input, tracks changes, handles form submission
- **List Presenter Hook**: `useListPresenter`; fetches list data, handles counting and infinite scroll
- **Base Page Hook**: `useBasePage`; handles application state, user authorization, and common UI methods

### Use Case Pattern

- Same as class-based: Implements request logic for business operations
- Designed for cancellation and parameterized queries
- Injected into presenter hooks as dependencies

---

## 🧪 Example Workflow

1. **Create** a new form page component
2. **Use** `useFormPresenter` hook with injected `UpsertUseCase`, `GetObjectUseCase`
3. The presenter hook handles schema validation, data fetching, and persistence
4. The component renders form fields automatically using schema definitions
5. Form submit flows through presenter hook → use case → API

---

## 📋 Page Structure Pattern

### Every Feature Contains Component and Hook

Each feature in the application follows a consistent pattern:

```
src/pages/feature-name/
├── FeatureNamePage.jsx      # View component (functional)
├── useFeatureNamePresenter.js  # Business logic hook
└── index.js                 # Export module
```

**Export Pattern - Direct Hook Usage:**

```javascript
// src/pages/feature-name/FeatureNamePage.jsx
import { useNavigate, useParams } from 'react-router-dom';
import { useFeatureNamePresenter } from './useFeatureNamePresenter';

function FeatureNamePage() {
  const navigate = useNavigate();
  const params = useParams();
  
  const presenter = useFeatureNamePresenter({
    navigate,
    params,
    // ... other dependencies
  });

  return (
    // ... JSX
  );
}

export default FeatureNamePage;
```

### Hook Composition Pattern

Instead of class inheritance, use hook composition:

```javascript
// src/hooks/useBasePage.js
export function useBasePage({ navigate }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const showConfirmDialog = useCallback((message, title = "Confirm", confirmText = "OK", cancelText = "Cancel", type = "default") => {
    return new Promise((resolve) => {
      const { close } = portal.open(
        <ConfirmDialog
          isOpen={true}
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          type={type}
          onConfirm={() => {
            close();
            resolve(true);
          }}
          onCancel={() => {
            close();
            resolve(false);
          }}
        />
      );
    });
  }, []);

  const showError = useCallback((error, title = "Error") => {
    return showConfirmDialog(
      typeof error === "string" ? error : error.message || "An error occurred", 
      title, 
      "OK", 
      null, 
      "danger"
    );
  }, [showConfirmDialog]);

  const showToast = useCallback((message, type = "info") => {
    portal.open(<Toast message={message} type={type} onClose={() => {}} />);
  }, []);

  return {
    loading,
    setLoading,
    progress,
    setProgress,
    showConfirmDialog,
    showError,
    showToast,
    navigate
  };
}
```

### Generic vs Custom Pages

#### Generic Pages (Schema-Driven)

For collections that don't require custom logic, use the generic pages:

- **CollectionListPage** - Generic list page for any collection (uses useListPresenter)
- **CollectionFormPage** - Generic form page for any collection (uses useFormPresenter)

These pages are driven by JSON schemas and automatically generate UI based on schema definitions.

---

## 🗂️ Menu Configuration Pattern

### menus.js Structure

Same as class-based version - the `src/pages/main/menus.js` file defines the application navigation structure and **returns an array** that gets passed to the NavSidebar component.

---

## 🛠 Architectural Guidelines

- Use PascalCase for component names, camelCase for hook names
- Hook naming: `useFeatureNamePresenter`, `useBasePage`, `useFormPresenter`

## Project Structure

### Directory Organization

```
src/
├── App.jsx               # Main application entry point
├── AppProvider.jsx       # Global state provider with Context
├── AppContext.jsx        # React context
├── api.js                # Core API client with authentication and request handling
├── portal.js             # Portal system for rendering components outside DOM hierarchy
├── hooks/                # Shared custom hooks
│   ├── useBasePage.js    # Base page hook with common functionality
│   ├── useListPresenter.js # Base list presenter hook
│   ├── useFormPresenter.js # Base form presenter hook
│   ├── useAuth.js        # Authentication hook
│   ├── useSchemas.js     # Schema management hook
│   └── [other-shared-hooks].js # Other reusable hooks
├── pages/                # Page components (functional)
│   ├── main/             # Main application pages
│   │   ├── MainPage.jsx  # Main layout component
│   │   ├── useMainPresenter.js # Main page business logic
│   │   └── menus.js      # Navigation configuration
│   ├── signin/           # Authentication pages
│   │   ├── SignInPage.jsx
│   │   ├── useSignInPresenter.js
│   │   └── index.js
│   ├── signup/           # Registration pages
│   │   ├── SignUpPage.jsx
│   │   ├── useSignUpPresenter.js
│   │   └── index.js
│   ├── dashboard/        # Dashboard pages
│   │   ├── DashboardPage.jsx
│   │   ├── useDashboardPresenter.js
│   │   └── index.js
│   ├── collection-list/  # Generic list page for any collection
│   │   ├── CollectionListPage.jsx
│   │   ├── useCollectionListPresenter.js
│   │   └── index.js
│   ├── collection-form/  # Generic form page for any collection
│   │   ├── CollectionFormPage.jsx
│   │   ├── useCollectionFormPresenter.js
│   │   └── index.js
│   └── [other-feature]/  # Feature-specific pages
│       ├── FeaturePage.jsx
│       ├── useFeaturePresenter.js
│       └── index.js
├── components/           # Reusable components
│   ├── FormFactory.jsx   # Dynamic form generator
│   ├── InputFactory.jsx  # Dynamic input generator
│   ├── Table.jsx         # Dynamic table generator
│   ├── MainLayout.jsx    # Layout components
│   ├── Navbar.jsx        # Top navigation bar components
│   ├── NavSidebar.jsx    # Collapsible sidebar navigation with menu items
│   ├── Sidebar.jsx       # Sidebar components
│   ├── Search.jsx        # Search components
│   ├── Spinner.jsx       # Spinner components
│   ├── ConfirmDialog.jsx # Confirmation dialog components
│   ├── Toast.jsx         # Toast notification components
│   └── [other-components].jsx # Other reusable components
├── usecases/             # Business logic (unchanged)
│   ├── user/             # User-related use cases
│   ├── object/           # Object CRUD use cases
│   ├── schema/           # Schema use cases
│   └── file/             # File handling use cases
└── [utility-files]       # Utility functions and helpers
```

### Naming Conventions

- **Pages**: `FeaturePage.jsx` (e.g., `CollectionFormPage.jsx`)
- **Presenter Hooks**: `useFeaturePresenter.js` (e.g., `useCollectionFormPresenter.js`)
- **Shared Hooks**: `useHookName.js` (e.g., `useBasePage.js`)
- **Use Cases**: `ActionObjectUseCase.js` (unchanged)
- **Components**: `ComponentName.jsx` (unchanged)

## 🔧 Hook Implementations

### useBasePage Hook

```javascript
// src/hooks/useBasePage.js
import { useState, useCallback, useContext } from 'react';
import Context from '../AppContext';
import portal from '../portal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export function useBasePage({ navigate }) {
  const context = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const showConfirmDialog = useCallback((message, title = "Confirm", confirmText = "OK", cancelText = "Cancel", type = "default") => {
    return new Promise((resolve) => {
      const { close } = portal.open(
        <ConfirmDialog
          isOpen={true}
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          type={type}
          onConfirm={() => {
            close();
            resolve(true);
          }}
          onCancel={() => {
            close();
            resolve(false);
          }}
        />
      );
    });
  }, []);

  const showError = useCallback((error, title = "Error") => {
    return showConfirmDialog(
      typeof error === "string" ? error : error.message || "An error occurred",
      title,
      "OK",
      null,
      "danger"
    );
  }, [showConfirmDialog]);

  const showToast = useCallback((message, type = "info") => {
    portal.open(<Toast message={message} type={type} onClose={() => {}} />);
  }, []);

  return {
    context,
    loading,
    setLoading,
    progress,
    setProgress,
    showConfirmDialog,
    showError,
    showToast,
    navigate
  };
}
```

### useListPresenter Hook

```javascript
// src/hooks/useListPresenter.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBasePage } from './useBasePage';

export function useListPresenter({ 
  navigate, 
  params, 
  findObjectsUseCase, 
  countObjectsUseCase, 
  deleteObjectUseCase 
}) {
  const basePage = useBasePage({ navigate });
  const [objects, setObjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ created: -1 });
  const searchTimeout = useRef(null);

  const getCollectionName = useCallback(() => {
    return params.collection;
  }, [params.collection]);

  const buildWhere = useCallback(() => {
    const { where } = params;
    if (!search?.trim()) return { ...filters, ...where };
    
    const schema = basePage.context.schemas?.find((s) => s.collection === getCollectionName());
    const fields = Object.entries(schema?.fields || {})
      .filter(([, p]) => p.type === "String")
      .map(([f]) => ({ [f]: { $regex: search, $options: "i" } }));
    
    return { $or: fields, ...filters, ...where };
  }, [search, filters, params.where, basePage.context.schemas, getCollectionName]);

  const loadData = useCallback(async () => {
    try {
      basePage.setLoading(true);
      const collection = getCollectionName();
      const where = buildWhere();
      
      const newObjects = await findObjectsUseCase.execute(collection, {
        where,
        limit,
        skip: (current - 1) * limit,
        sort,
      });
      
      const newCount = await countObjectsUseCase.execute(collection, where);
      
      setObjects(prev => current === 1 ? newObjects : [...prev, ...newObjects]);
      setCount(newCount);
      basePage.setLoading(false);
    } catch (error) {
      basePage.setLoading(false);
      await basePage.showError(error);
    }
  }, [current, limit, sort, buildWhere, getCollectionName, findObjectsUseCase, countObjectsUseCase, basePage]);

  const loadMore = useCallback(async () => {
    if (!basePage.loading) {
      setCurrent(prev => prev + 1);
    }
  }, [basePage.loading]);

  const reset = useCallback(() => {
    setCurrent(1);
    setObjects([]);
    setSelected([]);
  }, []);

  const handleSearchChange = useCallback((value) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    setSearch(value);
    searchTimeout.current = setTimeout(() => {
      reset();
      loadData();
    }, 500);
  }, [reset, loadData]);

  const deleteSelected = useCallback(async () => {
    if (selected.length === 0) return;
    
    const confirmed = await basePage.showConfirmDialog(
      `Are you sure you want to delete ${selected.length} item(s)?`,
      "Confirm Delete",
      "DELETE",
      "CANCEL",
      "danger"
    );
    
    if (confirmed) {
      try {
        basePage.setLoading(true);
        const collection = getCollectionName();
        
        await Promise.all(
          selected.map(id => deleteObjectUseCase.execute(collection, id))
        );
        
        setSelected([]);
        reset();
        await loadData();
        basePage.showToast(`${selected.length} item(s) deleted successfully`, "success");
      } catch (error) {
        basePage.setLoading(false);
        await basePage.showError(error);
      }
    }
  }, [selected, basePage, getCollectionName, deleteObjectUseCase, reset, loadData]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load more when current page changes
  useEffect(() => {
    if (current > 1) {
      loadData();
    }
  }, [current, loadData]);

  return {
    ...basePage,
    // State
    objects,
    selected,
    count,
    current,
    limit,
    search,
    filters,
    sort,
    // Methods
    setSelected,
    setFilters,
    setSort,
    getCollectionName,
    loadData,
    loadMore,
    reset,
    handleSearchChange,
    deleteSelected,
    // Computed
    hasMore: count > objects.length
  };
}
```

### useFormPresenter Hook

```javascript
// src/hooks/useFormPresenter.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBasePage } from './useBasePage';

export function useFormPresenter({ 
  navigate, 
  params, 
  getObjectUseCase, 
  upsertObjectUseCase 
}) {
  const basePage = useBasePage({ navigate });
  const [object, setObject] = useState({});
  const [change, setChange] = useState({});
  const [advanced, setAdvanced] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const originalObject = useRef({});

  const getCollectionName = useCallback(() => {
    return params.collection;
  }, [params.collection]);

  const getId = useCallback(() => {
    return params.id;
  }, [params.id]);

  const isNew = useCallback(() => {
    return getId() === 'new';
  }, [getId]);

  const loadData = useCallback(async () => {
    if (isNew()) {
      const emptyObject = {};
      setObject(emptyObject);
      originalObject.current = emptyObject;
      basePage.setLoading(false);
      return;
    }

    try {
      basePage.setLoading(true);
      const collection = getCollectionName();
      const id = getId();
      
      const loadedObject = await getObjectUseCase.execute(collection, id);
      setObject(loadedObject);
      originalObject.current = { ...loadedObject };
      basePage.setLoading(false);
    } catch (error) {
      basePage.setLoading(false);
      await basePage.showError(error);
    }
  }, [isNew, getCollectionName, getId, getObjectUseCase, basePage]);

  const handleChange = useCallback((field, value) => {
    setChange(prev => ({
      ...prev,
      [field]: value
    }));
    
    setObject(prev => ({
      ...prev,
      [field]: value
    }));

    // Check if dirty
    const newObject = { ...object, [field]: value };
    const isDirty = JSON.stringify(newObject) !== JSON.stringify(originalObject.current);
    setDirty(isDirty);
  }, [object]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (submitting) return;
    
    try {
      setSubmitting(true);
      const collection = getCollectionName();
      
      let objectToSave;
      if (isNew()) {
        objectToSave = object;
      } else {
        objectToSave = {
          _id: getId(),
          ...change
        };
      }

      const savedObject = await upsertObjectUseCase.execute(collection, objectToSave);
      
      setDirty(false);
      setChange({});
      originalObject.current = { ...savedObject };
      
      basePage.showToast(
        isNew() ? "Object created successfully" : "Object updated successfully", 
        "success"
      );
      
      // Navigate to edit mode if it was a new object
      if (isNew()) {
        navigate(`/collections/${collection}/form/${savedObject._id}`);
      }
      
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      await basePage.showError(error);
    }
  }, [submitting, getCollectionName, isNew, object, change, getId, upsertObjectUseCase, basePage, navigate]);

  const handleCancel = useCallback(async () => {
    if (dirty) {
      const confirmed = await basePage.showConfirmDialog(
        "You have unsaved changes. Are you sure you want to leave?",
        "Unsaved Changes",
        "LEAVE",
        "STAY",
        "warning"
      );
      
      if (!confirmed) return;
    }
    
    const collection = getCollectionName();
    navigate(`/collections/${collection}`);
  }, [dirty, basePage, getCollectionName, navigate]);

  const toggleAdvanced = useCallback(() => {
    setAdvanced(prev => !prev);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  return {
    ...basePage,
    // State
    object,
    change,
    advanced,
    dirty,
    submitting,
    // Methods
    setObject,
    setChange,
    setAdvanced,
    getCollectionName,
    getId,
    isNew,
    loadData,
    handleChange,
    handleSubmit,
    handleCancel,
    toggleAdvanced
  };
}
```

### useMainPresenter Hook

```javascript
// src/pages/main/useMainPresenter.js
import { useEffect, useCallback } from 'react';
import { useBasePage } from '../../hooks/useBasePage';

export function useMainPresenter({ 
  navigate, 
  getCurrentUserUseCase, 
  signOutUseCase, 
  getSchemasUseCase 
}) {
  const basePage = useBasePage({ navigate });

  const initialize = useCallback(async () => {
    basePage.setLoading(true);
    try {
      const user = await getCurrentUserUseCase.execute();
      if (!user.roles && !user.isMaster) {
        await signOutUseCase.execute();
        navigate("/denied");
        return;
      }
      
      const schemas = await getSchemasUseCase.execute();
      basePage.context.setGlobalState({ schemas, user });
      basePage.setLoading(false);
    } catch (error) {
      basePage.setLoading(false);
      switch (error.code) {
        case 401:
          navigate("/signin");
          break;
        default:
          basePage.showError(error);
      }
    }
  }, [getCurrentUserUseCase, signOutUseCase, getSchemasUseCase, navigate, basePage]);

  const handleSignOut = useCallback(async () => {
    const confirmed = await basePage.showConfirmDialog(
      "Are you sure you want to sign out?",
      "Confirm",
      "SIGN OUT",
      "CANCEL"
    );
    
    if (confirmed) {
      try {
        await signOutUseCase.execute();
        navigate("/signin");
      } catch (error) {
        basePage.showError(error);
      }
    }
  }, [signOutUseCase, navigate, basePage]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...basePage,
    initialize,
    handleSignOut
  };
}
```

## 📄 Example Page Implementation

### CollectionListPage

```javascript
// src/pages/collection-list/CollectionListPage.jsx
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useListPresenter } from '../../hooks/useListPresenter';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import Spinner from '../../components/Spinner';
import Search from '../../components/Search';

// Use case imports
import FindObjectsUseCase from '../../usecases/object/FindObjectsUseCase';
import CountObjectsUseCase from '../../usecases/object/CountObjectsUseCase';
import DeleteObjectUseCase from '../../usecases/object/DeleteObjectUseCase';

function CollectionListPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Create use case instances
  const findObjectsUseCase = new FindObjectsUseCase();
  const countObjectsUseCase = new CountObjectsUseCase();
  const deleteObjectUseCase = new DeleteObjectUseCase();

  const presenter = useListPresenter({
    navigate,
    params: {
      ...params,
      where: searchParams.get('where') ? JSON.parse(searchParams.get('where')) : {}
    },
    findObjectsUseCase,
    countObjectsUseCase,
    deleteObjectUseCase
  });

  const {
    context,
    loading,
    objects,
    selected,
    count,
    search,
    setSelected,
    handleSearchChange,
    loadMore,
    deleteSelected,
    hasMore,
    getCollectionName
  } = presenter;

  if (loading && objects.length === 0) {
    return <Spinner centered />;
  }

  const collection = getCollectionName();
  const schema = context.schemas?.find(s => s.collection === collection);

  return (
    <div className="flex flex-col h-screen">
      <Navbar 
        title={schema?.label || collection}
        onSearch={handleSearchChange}
        searchValue={search}
      />
      
      <div className="overflow-auto" id="scrollable">
        <InfiniteScroll
          className="h-100"
          dataLength={objects.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-center py-4">
              <Spinner centered/>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          }
          scrollableTarget="scrollable"
        >
          <Table
            schema={schema}
            objects={objects}
            selected={selected}
            onSelectionChange={setSelected}
          />
        </InfiniteScroll>
      </div>

      {/* Floating Add Button */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
        onClick={() => navigate(`/collections/${collection}/form/new`)}
      >
        +
      </button>

      {/* Delete Selected Button */}
      {selected.length > 0 && (
        <button
          className="fixed bottom-20 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
          onClick={deleteSelected}
        >
          🗑️
        </button>
      )}
    </div>
  );
}

export default CollectionListPage;
```

### CollectionFormPage

```javascript
// src/pages/collection-form/CollectionFormPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormPresenter } from '../../hooks/useFormPresenter';
import Navbar from '../../components/Navbar';
import FormFactory from '../../components/FormFactory';
import Spinner from '../../components/Spinner';

// Use case imports
import GetObjectUseCase from '../../usecases/object/GetObjectUseCase';
import UpsertObjectUseCase from '../../usecases/object/UpsertObjectUseCase';

function CollectionFormPage() {
  const navigate = useNavigate();
  const params = useParams();

  // Create use case instances
  const getObjectUseCase = new GetObjectUseCase();
  const upsertObjectUseCase = new UpsertObjectUseCase();

  const presenter = useFormPresenter({
    navigate,
    params,
    getObjectUseCase,
    upsertObjectUseCase
  });

  const {
    context,
    loading,
    object,
    advanced,
    dirty,
    submitting,
    isNew,
    getCollectionName,
    handleChange,
    handleSubmit,
    handleCancel,
    toggleAdvanced
  } = presenter;

  if (loading) {
    return <Spinner centered />;
  }

  const collection = getCollectionName();
  const schema = context.schemas?.find(s => s.collection === collection);

  return (
    <div className="flex flex-col h-screen">
      <Navbar 
        title={`${isNew() ? 'New' : 'Edit'} ${schema?.label || collection}`}
        showBack
        onBack={handleCancel}
      />
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
        <FormFactory
          schema={schema}
          object={object}
          onChange={handleChange}
          advanced={advanced}
        />
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={toggleAdvanced}
            className="text-blue-500 hover:text-blue-600"
          >
            {advanced ? 'Hide' : 'Show'} Advanced
          </button>
          
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={submitting || !dirty}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CollectionFormPage;
```

## 🎨 Schema-