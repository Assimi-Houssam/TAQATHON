# Data Table Component System

A comprehensive, feature-rich data table system built with React, TypeScript, and Tailwind CSS. This system provides everything you need to create powerful data tables with search, filtering, sorting, and pagination.

## Features

- ✅ **TypeScript Support** - Full type safety with generic components
- ✅ **Search & Filtering** - Real-time search with debouncing and multi-select filters
- ✅ **Sorting** - Client-side sorting with visual indicators
- ✅ **Pagination** - Configurable page sizes and navigation
- ✅ **Responsive Design** - Mobile-friendly with hidden columns
- ✅ **Custom Renderers** - Flexible cell rendering with React components
- ✅ **Loading States** - Built-in loading, error, and empty states
- ✅ **Animations** - Smooth transitions with Framer Motion
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Internationalization** - Ready for i18n with next-intl

## New Features

### Column Visibility Controls

Users can now show/hide columns using the column visibility dropdown:

```tsx
import { DataTable } from "@/components/data-table";

const columns = [
  { header: "ID", accessor: "id", hideable: true },
  { header: "Name", accessor: "name", hideable: true },
  { header: "Email", accessor: "email", hideable: true },
  { header: "Actions", accessor: "actions", hideable: false }, // Cannot be hidden
];

function MyTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      config={{
        columnVisibility: true, // Enable column visibility controls
        defaultHiddenColumns: ["email"], // Hide email column by default
      }}
    />
  );
}
```

### Enhanced Filtering

The search bar now supports multiple persistent filters:

```tsx
const filters = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ],
  },
  {
    key: "role",
    label: "Role",
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
      { value: "guest", label: "Guest" },
    ],
  },
];

function MyTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      filters={filters}
      config={{
        filterable: true,
        searchable: true,
      }}
    />
  );
}
```

### Key Features

1. **Column Visibility**: Users can show/hide columns via dropdown
   - Checkboxes for each hideable column
   - Show All / Hide All buttons
   - Persistent state management
   - Configurable default hidden columns

2. **Enhanced Filtering**: Multiple filters can be applied simultaneously
   - Checkbox-based filter selection
   - Persistent filter state
   - Clear individual or all filters
   - Filter badges showing active filters

3. **Improved Search**: Search with persistent filters
   - Real-time search with debouncing
   - Works alongside filters
   - Configurable search fields

### Configuration Options

```tsx
interface DataTableConfig<T> {
  // ... existing options ...
  columnVisibility?: boolean; // Enable column visibility controls
  defaultHiddenColumns?: (keyof T)[]; // Columns hidden by default
}

interface Column<T> {
  // ... existing properties ...
  hideable?: boolean; // Whether column can be hidden (default: true)
  defaultVisible?: boolean; // Default visibility state
}
```

## Quick Start

### 1. Basic Usage

```tsx
import { DataTable, Column } from "@/components/data-table";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
];

const columns: Column<User>[] = [
  { header: "Name", accessor: "name", clickable: true },
  { header: "Email", accessor: "email", clickable: true },
  { header: "Role", accessor: "role", clickable: true },
];

export function UsersTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
    />
  );
}
```

### 2. Advanced Usage with Custom Renderers

```tsx
import { DataTable, Column, DataTableConfig } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const columns: Column<User>[] = [
  {
    header: "Name",
    accessor: "name",
    width: "200px",
    clickable: true,
  },
  {
    header: "Role",
    accessor: "role",
    width: "120px",
    clickable: true,
    render: (value) => (
      <Badge variant={value === "Admin" ? "default" : "secondary"}>
        {value}
      </Badge>
    ),
  },
  {
    header: "Actions",
    accessor: "id",
    width: "150px",
    clickable: false,
    render: (value, user) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => editUser(user)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => deleteUser(user)}>
          Delete
        </Button>
      </div>
    ),
  },
];

const config: DataTableConfig<User> = {
  searchable: true,
  sortable: true,
  filterable: true,
  paginated: true,
  pageSize: 10,
  searchFields: ["name", "email"],
  defaultSort: { field: "name", direction: "asc" },
};

const filters = [
  {
    key: "role",
    label: "Role",
    options: [
      { value: "Admin", label: "Admin" },
      { value: "User", label: "User" },
    ],
  },
];

export function AdvancedUsersTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      config={config}
      filters={filters}
    />
  );
}
```

### 3. Using the Custom Hook

```tsx
import { useDataTable } from "@/components/data-table";

export function CustomTable() {
  const {
    data,
    currentPage,
    totalPages,
    searchTerm,
    handleSearch,
    handleSort,
    handlePageChange,
  } = useDataTable({
    data: users,
    config: {
      pageSize: 5,
      searchFields: ["name", "email"],
    },
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      {/* Your custom table implementation */}
      <table>
        {/* ... */}
      </table>
      
      <div>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
```

## Components

### DataTable

The main component that combines all features.

#### Props

```tsx
interface DataTableProps<T> {
  data: T[];                    // Your data array
  columns: Column<T>[];         // Column definitions
  config?: DataTableConfig<T>;  // Configuration options
  className?: string;           // Additional CSS classes
  loading?: boolean;            // Loading state
  error?: Error | null;         // Error state
  filters?: FilterGroup[];      // Filter definitions
  onRowClick?: (row: T) => void; // Row click handler
}
```

### Column Definition

```tsx
interface Column<T> {
  header: string;               // Column header text
  accessor: keyof T;            // Data property key
  width?: string;               // Column width (CSS)
  render?: (value: T[keyof T], item: T) => React.ReactNode; // Custom renderer
  hidden?: boolean;             // Hide on mobile
  clickable?: boolean;          // Enable sorting
  hideable?: boolean;           // Whether column can be hidden (default: true)
  defaultVisible?: boolean;     // Default visibility state
}
```

### Configuration Options

```tsx
interface DataTableConfig<T> {
  searchable?: boolean;         // Enable search (default: true)
  sortable?: boolean;           // Enable sorting (default: true)
  filterable?: boolean;         // Enable filtering (default: true)
  paginated?: boolean;          // Enable pagination (default: true)
  pageSize?: number;            // Items per page (default: 10)
  searchFields?: (keyof T)[];   // Fields to search in
  defaultSort?: SortConfig<T>;  // Default sort configuration
  columnVisibility?: boolean;    // Enable column visibility controls
  defaultHiddenColumns?: (keyof T)[]; // Columns hidden by default
}
```

## Best Practices

### 1. Column Configuration

```tsx
// ✅ Good: Specify widths for better layout
const columns: Column<User>[] = [
  { header: "Name", accessor: "name", width: "200px", clickable: true },
  { header: "Email", accessor: "email", width: "250px", clickable: true },
  { header: "Actions", accessor: "id", width: "150px", clickable: false },
];

// ❌ Avoid: No width specified, layout may shift
const columns: Column<User>[] = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
];
```

### 2. Custom Renderers

```tsx
// ✅ Good: Use custom renderers for complex content
{
  header: "Status",
  accessor: "status",
  render: (value) => (
    <Badge variant={value === "active" ? "default" : "secondary"}>
      {value}
    </Badge>
  ),
}

// ✅ Good: Access full row data in renderers
{
  header: "Actions",
  accessor: "id",
  render: (value, user) => (
    <Button onClick={() => handleEdit(user)}>
      Edit {user.name}
    </Button>
  ),
}
```

### 3. Performance Optimization

```tsx
// ✅ Good: Memoize expensive operations
const columns = useMemo(() => [
  // ... column definitions
], []);

const config = useMemo(() => ({
  pageSize: 10,
  searchFields: ["name", "email"],
}), []);

// ✅ Good: Use specific search fields
const config: DataTableConfig<User> = {
  searchFields: ["name", "email"], // Only search in these fields
};
```

### 4. Error Handling

```tsx
// ✅ Good: Handle loading and error states
<DataTable
  data={users}
  columns={columns}
  loading={isLoading}
  error={error}
/>
```

## Migration from Existing Code

If you're migrating from the old `OCPDataTable-new` system:

1. **Update imports:**
   ```tsx
   // Old
   import { UnifiedDataTable } from "@/components/ui/ocp/layout/OCPDataTable-new";
   
   // New
   import { DataTable } from "@/components/data-table";
   ```

2. **Update component usage:**
   ```tsx
   // Old
   <UnifiedDataTable
     columns={columns}
     queryResult={queryResult}
     searchableFields={searchableFields}
     page={page}
     onPageChange={onPageChange}
     limit={limit}
   />
   
   // New
   <DataTable
     data={data}
     columns={columns}
     config={{
       searchFields: searchableFields,
       pageSize: limit,
     }}
   />
   ```

## Templates

Use the `BasicDataTable` template as a starting point:

```tsx
import { BasicDataTable } from "@/components/data-table";

// Copy the template and modify for your needs
export function MyDataTable() {
  // ... your implementation
}
```

## Styling

The components use Tailwind CSS and shadcn/ui components. You can customize the appearance by:

1. **Passing className props:**
   ```tsx
   <DataTable className="custom-table" />
   ```

2. **Customizing shadcn/ui components:**
   ```tsx
   // Modify the base table components in your theme
   ```

3. **Using CSS variables:**
   ```css
   .custom-table {
     --table-header-bg: rgb(249 250 251);
   }
   ```

## Accessibility

The components include:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure

## Contributing

When adding new features:

1. Update the type definitions in `types/index.ts`
2. Add comprehensive JSDoc comments
3. Update this README with examples
4. Add tests for new functionality
5. Ensure responsive design works

## Troubleshooting

### Common Issues

1. **"Property does not exist on type"**
   - Ensure your data type includes all properties used in columns
   - Check that `accessor` matches your data structure

2. **Pagination not working**
   - Verify `pageSize` is set correctly
   - Check that `paginated` is not set to `false`

3. **Search not working**
   - Ensure `searchFields` includes the fields you want to search
   - Check that `searchable` is not set to `false`

4. **Performance issues**
   - Memoize columns and config objects
   - Consider server-side pagination for large datasets
   - Use specific search fields instead of searching all fields 