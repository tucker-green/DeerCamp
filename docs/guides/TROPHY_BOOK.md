# Trophy Book Guide

Complete guide to harvest tracking and the Trophy Book feature in DeerCamp.

## Overview

The Trophy Book system tracks all harvests, calculates club records, and maintains leaderboards. It provides detailed analytics for hunting success.

## Logging Harvests

### Required Information

| Field | Description |
|-------|-------------|
| Species | Whitetail, turkey, hog, etc. |
| Date | When harvested |
| Weapon | Rifle, bow, etc. |

### Optional Information

- Sex (buck/doe, tom/hen, boar/sow)
- Weight (field dressed or live)
- Location/stand
- Photos
- Detailed measurements
- Weather conditions
- Hunt story

### How to Log

1. Go to **Harvests** page
2. Click "Log New Harvest"
3. Select species
4. Enter date
5. Choose weapon type
6. Add photos (optional)
7. Fill additional details
8. Click "Save"

---

## Species-Specific Measurements

### Deer (Whitetail, Mule Deer)

| Measurement | Unit | Description |
|-------------|------|-------------|
| Points | Count | Antler tines |
| Inside Spread | Inches | Widest inner measurement |
| Main Beam Length | Inches | Average of both beams |
| Mass | Inches | Base circumference |
| Gross Score | Points | B&C gross score |
| Net Score | Points | B&C net score |
| Typical | Yes/No | Typical or non-typical |
| Field Dressed Weight | Pounds | After field dressing |
| Live Weight | Pounds | Estimated live weight |
| Age | Years | Estimated age |

### Turkey

| Measurement | Unit | Description |
|-------------|------|-------------|
| Beard Length | Inches | Primary beard |
| Spur Length | Inches | Average of both spurs |
| Weight | Pounds | Whole bird weight |

### Hog

| Measurement | Unit | Description |
|-------------|------|-------------|
| Weight | Pounds | Live or dressed |
| Tusk Length | Inches | Visible tusk length |

---

## Hunt Details

### Shot Information

| Field | Options |
|-------|---------|
| Shot Distance | Yards |
| Shot Placement | Heart, lungs, shoulder, etc. |
| Tracking Distance | Yards to recovery |

### Weather Conditions

| Field | Options |
|-------|---------|
| Temperature | Degrees F |
| Wind Direction | N, NE, E, SE, S, SW, W, NW |
| Wind Speed | MPH |
| Moon Phase | New, quarter, full, etc. |
| Conditions | Clear, cloudy, rain, etc. |

---

## Trophy Book Records

### Record Categories

| Category | Description |
|----------|-------------|
| Biggest Buck (Score) | Highest B&C score |
| Biggest Buck (Points) | Most antler points |
| Biggest Buck (Spread) | Widest spread |
| Heaviest Deer | Highest weight |
| Heaviest Buck | Heaviest male deer |
| Heaviest Doe | Heaviest female deer |
| Biggest Turkey (Beard) | Longest beard |
| Biggest Turkey (Spurs) | Longest spurs |
| Heaviest Turkey | Highest weight |
| Biggest Hog | Heaviest hog |
| First Harvest | First of season |
| Most Harvests | Most in a season |

### How Records Work

1. System automatically evaluates new harvests
2. Compares against existing club records
3. Updates records when beaten
4. Displays in Trophy Book page

### Checking for Records

When you log a harvest, the system checks:
- Is this a new club record?
- Which categories does it beat?
- Updates `isClubRecord` and `recordCategories`

---

## Leaderboards

### Season Leaderboard

Shows top hunters by total harvests for the season.

### Category Leaderboards

Available for each record category:
- Top 10 entries
- Harvest details
- Hunter name
- Measurement value

---

## Statistics

### Club Statistics

| Stat | Description |
|------|-------------|
| Total Harvests | All-time count |
| By Species | Deer, turkey, hog breakdown |
| By Sex | Buck/doe, tom/hen ratios |
| By Weapon | Rifle, bow, etc. breakdown |
| Average Weight | Mean harvest weight |
| By Month | Harvest distribution |
| Top Hunters | Most successful members |

### Filtering Statistics

Filter by season:
- All-time
- Current season
- Previous seasons (by year)

---

## Photos

### Upload Guidelines

| Type | Max Size | Formats |
|------|----------|---------|
| Images | 10 MB | JPEG, PNG, GIF, WEBP |

### Photo Tips

1. Good lighting shows details
2. Include scale reference
3. Multiple angles helpful
4. Field photos are great
5. Processing photos optional

### Multiple Photos

You can upload multiple photos per harvest:
- Main photo (displayed in feeds)
- Additional photos (in harvest detail)

---

## Hunt Stories

### Writing Stories

The story field allows narrative descriptions:
- How you got to the stand
- Weather and conditions
- The hunt unfold
- The shot and recovery
- What made it special

### Story Tips

1. Include the details that matter
2. Describe the setup and approach
3. Note weather and timing
4. Share the excitement
5. Thank those who helped

---

## Activity Feed Integration

### Auto-Posted Harvests

When you log a harvest:
1. Post created automatically
2. Appears in club feed
3. Shows main photo
4. Links to full harvest details

### Engagement

Club members can:
- React to harvest posts
- Comment congratulations
- View full details

---

## Best Practices

### Accurate Recording

1. **Measure carefully**: Use proper techniques
2. **Record immediately**: Don't forget details
3. **Take photos first**: Before processing
4. **Document conditions**: Weather, time, etc.
5. **Be honest**: Records should be accurate

### Building Club History

1. **Log every harvest**: Complete records matter
2. **Include stories**: Future generations will appreciate
3. **Upload photos**: Visual history
4. **Note stands used**: Track success patterns
5. **Record details**: More data = better insights

---

## Troubleshooting

### Photo upload issues

1. Check file size (< 10 MB)
2. Verify format (JPEG, PNG)
3. Check internet connection
4. Try smaller file

### Missing statistics

1. Ensure harvests have required fields
2. Check species is selected
3. Verify dates are valid
4. Wait for data to sync

### Record not showing

1. Verify measurement entered
2. Check units are correct
3. Compare against existing records
4. Contact manager if issues persist

---

*Trophy Book documentation for DeerCamp*
