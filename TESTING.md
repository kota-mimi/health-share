# Daily Log Share App - Testing Guide

## Fixed Issues

### 1. React Version Mismatch (CRITICAL)
- **Problem**: Import map used React 19 while package.json had React 18
- **Fix**: Updated import map to use React 18.2.0 to match package.json
- **Impact**: Prevented rendering failures and black screens

### 2. Error Boundary Added
- **Problem**: No error handling for React errors
- **Fix**: Added ErrorBoundary component to catch and display errors gracefully
- **Impact**: Instead of black screen, users see friendly error message

### 3. Enhanced URL Parameter Handling
- **Problem**: Poor error handling for malformed URL data
- **Fix**: Added comprehensive validation and logging
- **Impact**: Better debugging and fallback to mock data

### 4. Tailwind Performance Fix
- **Problem**: Content pattern matched node_modules causing warnings
- **Fix**: Specific patterns targeting only app files
- **Impact**: Faster build times and cleaner output

## Testing URLs

### Basic App (No Data)
```
http://localhost:3001/
```

### With Test Data
```
http://localhost:3001/?data=%7B%22date%22%3A%20%222024-12-13%22%2C%20%22weight%22%3A%2072.4%2C%20%22weightDiff%22%3A%20-0.4%2C%20%22calories%22%3A%201850%2C%20%22caloriesTarget%22%3A%202100%2C%20%22protein%22%3A%20145%2C%20%22fat%22%3A%2048%2C%20%22carbs%22%3A%20210%2C%20%22exerciseTime%22%3A%2045%2C%22exerciseBurned%22%3A%20320%2C%20%22achievementRate%22%3A%2088%7D
```

## Expected URL Data Format

The app expects a JSON object with these properties:
- `date`: ISO date string
- `weight`: Current weight (number)
- `weightDiff`: Weight change (number, can be negative)
- `calories`: Current calories (number)
- `caloriesTarget`: Target calories (number)
- `protein`: Protein grams (number)
- `fat`: Fat grams (number)  
- `carbs`: Carbohydrate grams (number)
- `exerciseTime`: Exercise minutes (number)
- `exerciseBurned`: Calories burned (number)
- `achievementRate`: Achievement percentage 0-100 (number)

## Debugging

Check browser console for:
- ✅ "Processed user data:" - successful data loading
- ⚠️ "No URL data found, using mock data" - no data parameter
- ❌ "Error parsing URL data:" - malformed data

## Development

```bash
cd /path/to/app
npm run dev
# App runs on http://localhost:3001
```