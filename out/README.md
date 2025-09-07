# Generated V75 Files

This directory contains automatically generated Markdown files with V75 data from ATG's API.

## File Types

- `v75_result_YYYY-MM-DD.md` - Race results for completed V75 rounds
- `v75_startlista_YYYY-MM-DD.md` - Start lists for upcoming V75 rounds

## Usage

Generate files using the npm scripts:

```bash
# Generate result file for a specific date
npm run v75:result -- 2025-09-06

# Generate start list for a specific date  
npm run v75:startlist -- 2025-09-13
```

Or use the script directly:

```bash
node scripts/generateV75.js result 2025-09-06
node scripts/generateV75.js startlist 2025-09-13
```

## File Structure

Each generated file contains:
- Race information (name, distance, start method)
- Horse data (name, driver, trainer, etc.)
- Results (place, time, odds, status) for completed races
- Start list data (handicap, form, earnings) for upcoming races
