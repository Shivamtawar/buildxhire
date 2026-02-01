# Browser Cache & Session Persistence Guide

## Overview
The BuildXHire application now uses browser localStorage to persist interview data across page reloads. This means if a user accidentally refreshes the page or closes the browser during an interview, their progress will be saved.

## What Gets Cached?

### In LocalStorage:
All interview state is stored in `localStorage` under the key `interviewState`:

```json
{
  "candidateId": "uuid-string",
  "sessionId": "uuid-string",
  "currentQuestion": "question text",
  "difficulty": "EASY|MEDIUM|HARD",
  "questionCount": 0,
  "scores": [45, 67, 89],
  "timeUsed": 1200,
  "interviewData": {...},
  "jobDescription": "job description text",
  "candidateProfile": {...}
}
```

### In SessionStorage:
For quick access during interview (fallback):
- `candidateId`
- `sessionId`
- `currentQuestion`

## How It Works

### 1. **App.jsx** - Screen Persistence
```javascript
- On mount: Checks for saved screen state in localStorage
- On screen change: Automatically saves current screen
- On restart/home: Clears localStorage
```

**Saved States:**
- `currentScreen` - Current UI screen (welcome, setup, interview, summary)

### 2. **InterviewContext.jsx** - Data Persistence
```javascript
- On mount: Restores all interview state from localStorage
- On state change: Automatically saves state to localStorage
- On reset: Clears all localStorage data
```

**Persistence Wrapper:**
Each state setter automatically saves to localStorage:
- `setCandidateId` → saves candidate info
- `setSessionId` → saves session info
- `setScores` → saves scores array
- `setInterviewData` → saves final results
- etc.

## Usage Scenarios

### Scenario 1: User Reloads During Setup
1. User fills resume and job description
2. User presses F5 (refresh)
3. App restores to "setup" screen
4. All previously entered data is restored
5. User can continue from where they left off

### Scenario 2: User Reloads During Interview
1. User is on question 5 of 10
2. Page accidentally closes
3. User reopens the app
4. App restores to "interview" screen
5. Current question, scores, and progress are restored
6. User can continue the interview

### Scenario 3: User Completes Interview & Reloads
1. User sees summary screen
2. User reloads page
3. App restores to "summary" screen
4. All interview results are displayed
5. User can click "Take Another Interview" to clear cache

### Scenario 4: User Clicks "Back to Home"
1. User is on summary screen
2. User clicks "Back to Home"
3. App clears localStorage
4. App goes to welcome screen
5. Starting a fresh interview

## Technical Implementation

### Storage Keys
```javascript
'interviewState'     // Main state object (InterviewContext)
'currentScreen'      // Current UI screen (App.jsx)
'interviewData'      // Interview results (used by App.jsx to check validity)
```

### Auto-Save Logic
```javascript
// Every state update triggers save
const handleSetCandidateId = (value) => {
  setCandidateId(value)
  saveState({ candidateId: value })  // Auto-save
}
```

### Recovery on Load
```javascript
// On component mount, restore from localStorage
useEffect(() => {
  const savedState = localStorage.getItem('interviewState')
  if (savedState) {
    const parsed = JSON.parse(savedState)
    // Restore all state variables
    setCandidateId(parsed.candidateId)
    setSessionId(parsed.sessionId)
    // ... etc
  }
}, [])
```

## Browser Compatibility

✅ Works with all modern browsers:
- Chrome/Edge 4+
- Firefox 3.5+
- Safari 4+
- Opera 10.5+

## Storage Limits

- Chrome: ~10MB per domain
- Firefox: ~10MB per domain
- Safari: ~5MB per domain
- IE: ~10MB per domain

Interview data typically uses < 100KB

## Clearing Cache

### Manual Clear (in browser console)
```javascript
localStorage.removeItem('interviewState')
localStorage.removeItem('currentScreen')
localStorage.removeItem('interviewData')
```

### Automatic Clear
- Clicking "Back to Home" on summary screen
- Clicking "Take Another Interview" on summary screen
- Browser "Clear Browsing Data" for the domain

## API Endpoints Used

The app works with these backend endpoints:

### Resume/Profile Analysis
- **POST** `/resume/analyze`
  - Input: `resume_text` (any text: resume, PDF content, or "about me")
  - Output: `candidate_id`, `candidate_profile`

### Interview Session Management
- **POST** `/interview/start`
  - Input: `candidate_id`, `job_description`
  - Output: `session_id`, `first_question`, `difficulty`, `time_limit`

- **GET** `/interview/next-question`
  - Input: `session_id` (query param)
  - Output: `question`, `difficulty`, `time_limit`

- **POST** `/interview/answer`
  - Input: `session_id`, `question`, `answer_text`, `time_taken`
  - Output: `score`, `status`, `feedback`, `next_difficulty`, `questions_remaining`

- **POST** `/interview/end`
  - Input: `session_id`
  - Output: `final_score`, `category`, `strengths`, `weaknesses`, `hiring_readiness`, etc.

## Debugging

### Check Stored Data
```javascript
// In browser console
JSON.parse(localStorage.getItem('interviewState'))
localStorage.getItem('currentScreen')
```

### Enable Logging
The InterviewContext logs errors when restoring state:
```javascript
console.error('Failed to restore interview state:', error)
```

### Force Reset
To completely reset the app:
1. Open DevTools (F12)
2. Go to Application tab
3. Click Storage → LocalStorage
4. Delete all entries for your domain
5. Refresh page

## Future Enhancements

- [ ] IndexedDB for larger data storage
- [ ] Automatic cloud sync
- [ ] Multiple interview sessions history
- [ ] Export results as PDF
- [ ] Email results summary
