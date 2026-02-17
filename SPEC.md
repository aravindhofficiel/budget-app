# Budget Tracker App Specification

## Project Overview
- **Project Name**: BudgetWise
- **Type**: Single-page web application (React + Vite)
- **Core Functionality**: Track income, expenses, and visualize budget data with charts
- **Target Users**: Individuals managing personal finances

## UI/UX Specification

### Layout Structure
- **Header**: App logo, total balance display
- **Main Content**: 
  - Summary cards (Income, Expenses, Balance)
  - Transaction form (add new entry)
  - Transaction history list
  - Charts section
- **Responsive Breakpoints**:
  - Mobile: < 640px (single column)
  - Tablet: 640px - 1024px (2 columns)
  - Desktop: > 1024px (3 columns for cards)

### Visual Design

#### Color Palette
- **Background**: #0f172a (slate-900)
- **Card Background**: #1e293b (slate-800)
- **Primary**: #22c55e (green-500) - for income
- **Secondary**: #ef4444 (red-500) - for expenses
- **Accent**: #f59e0b (amber-500) - for balance/warnings
- **Text Primary**: #f8fafc (slate-50)
- **Text Secondary**: #94a3b8 (slate-400)
- **Border**: #334155 (slate-700)

#### Typography
- **Font Family**: "Outfit" (Google Fonts) - modern, clean
- **Headings**: 700 weight, sizes: h1=2rem, h2=1.5rem, h3=1.25rem
- **Body**: 400 weight, 1rem
- **Numbers**: "JetBrains Mono" for financial figures

#### Spacing
- **Container padding**: 1.5rem (mobile), 2rem (desktop)
- **Card padding**: 1.25rem
- **Gap between elements**: 1rem
- **Border radius**: 0.75rem (cards), 0.5rem (inputs/buttons)

#### Visual Effects
- **Cards**: subtle glow effect on hover
- **Buttons**: scale(1.02) on hover with transition
- **List items**: slide-in animation on add
- **Chart**: smooth pie chart transitions

### Components

1. **Summary Cards** (3 cards in a row)
   - Total Income (green accent)
   - Total Expenses (red accent)
   - Current Balance (amber accent when negative, green when positive)

2. **Add Transaction Form**
   - Type toggle (Income/Expense)
   - Description input
   - Amount input (number)
   - Category dropdown
   - Date picker
   - Submit button

3. **Transaction List**
   - Scrollable list with infinite scroll
   - Each item shows: category icon, description, date, amount
   - Color-coded: green for income, red for expense
   - Delete button on each item
   - Filter by type (All/Income/Expense)

4. **Charts Section**
   - Pie chart: Expense breakdown by category
   - Bar chart: Monthly income vs expenses

5. **Category Management**
   - Predefined categories: Food, Transport, Shopping, Bills, Entertainment, Health, Salary, Other
   - Each category has an icon and color

## Functionality Specification

### Core Features
1. **Add Transaction**: Create income or expense with amount, description, category, date
2. **View Transactions**: List all transactions with filtering and sorting
3. **Delete Transaction**: Remove any transaction
4. **Summary Dashboard**: Real-time calculation of totals
5. **Visual Analytics**: Charts showing spending patterns
6. **Data Persistence**: All data saved to localStorage
7. **Export Data**: Download transactions as CSV

### User Interactions
- Click "Add" to open transaction form modal
- Toggle switch between Income/Expense
- Select category from dropdown with icons
- Click delete icon to remove transaction
- Filter transactions by type
- Hover on charts for details

### Data Handling
- **Transaction Schema**: { id, type, amount, description, category, date }
- **Storage**: localStorage with key "budgetTransactions"
- **Initial State**: Empty array if no data

### Edge Cases
- Empty state: Show friendly message with CTA
- Negative balance: Display in red with warning
- Very long description: Truncate with ellipsis
- Large numbers: Format with commas
- Invalid input: Show validation errors

## Acceptance Criteria

1. ✅ App loads without errors
2. ✅ Can add income transaction
3. ✅ Can add expense transaction  
4. ✅ Transactions persist after page refresh
5. ✅ Can delete any transaction
6. ✅ Summary updates in real-time
7. ✅ Pie chart shows category breakdown
8. ✅ Bar chart shows monthly comparison
9. ✅ Fully responsive on mobile devices
10. ✅ Filter transactions by type works
11. ✅ Export to CSV downloads file
12. ✅ Empty state displays correctly
