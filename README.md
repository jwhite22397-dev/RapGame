# RAP GAME

A mobile-first music career simulation game where you start as an unknown rapper and build your career from the ground up.

## Play the game

GitHub does not run the game from the repo or PR page. Use one of these:

### Fastest: run it on your computer

```bash
git clone https://github.com/jwhite22397-dev/RapGame.git
cd RapGame
git checkout cursor/rap-game-mvp-84cd
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser. Resize to a phone width (~390px) or open it on your phone using your computer’s local IP.

### On GitHub: Codespaces

1. Open [the repo](https://github.com/jwhite22397-dev/RapGame)
2. Switch to the `cursor/rap-game-mvp-84cd` branch
3. Click **Code → Codespaces → Create codespace**
4. In the Codespace terminal:

```bash
npm install
npm run dev
```

5. Click the forwarded port / **Open in Browser**

### After merge: GitHub Pages

Once Pages is enabled (**Settings → Pages → Source: GitHub Actions**), the live game will be at:

**https://jwhite22397-dev.github.io/RapGame/**

You can also run the **Deploy to GitHub Pages** workflow manually from the Actions tab.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── components/          # React UI components
│   ├── ui/             # Base UI components (Button, Card, Modal, etc.)
│   ├── layout/         # Layout components (GameLayout, Header, BottomNav)
│   └── dev/            # Development tools (DevPanel)
├── screens/            # Full-screen views
├── game/               # Game simulation engine (UI-independent)
│   ├── engine/         # Core simulation logic
│   │   ├── rng.ts      # Seeded random number generator
│   │   ├── player.ts   # Player creation and management
│   │   ├── streaming.ts # Streaming simulation
│   │   ├── charts.ts   # Chart system
│   │   ├── simulation.ts # Main weekly simulation loop
│   │   ├── actions.ts  # Player action handlers
│   │   └── generators.ts # Content generators
│   ├── models/         # TypeScript type definitions
│   ├── balance/        # Game balance constants
│   ├── data/           # Static game data (events, genres, archetypes)
│   └── services/       # Services (save system)
├── store/              # Zustand state management
├── utils/              # Utility functions
├── tests/              # Vitest tests
└── assets/             # Static assets
```

## Game Balance

All tunable game values are centralized in `src/game/balance/constants.ts`:

- Streaming economics (rates, decay, viral multipliers)
- Energy costs for actions
- Career tier thresholds
- Chart requirements
- Label deal parameters
- Marketing tiers
- And more...

## Adding Events

Events are defined in `src/game/data/events.ts`. Each event has:

```typescript
{
  id: 'unique-id',
  type: 'opportunity' | 'setback' | 'success' | 'viral' | etc,
  title: 'Event Title',
  description: 'Description with {placeholder} support',
  rarity: 0.1,  // Probability (0-1)
  cooldownWeeks: 10,
  requirements: {
    minCareerTier?: 'underground',
    minFollowers?: 5000,
    // etc
  },
  choices: [
    {
      id: 'choice-id',
      text: 'Choice description',
      cost: { type: 'energy', amount: 20 },
      effects: [
        { type: 'hype', value: 10 },
        { type: 'followers', value: 500 },
      ],
    }
  ],
  tags: ['category'],
}
```

## Adding Labels/NPCs

- Labels: `src/game/data/labels.ts`
- NPC name pools: `src/game/data/names.ts`
- Archetypes: `src/game/data/archetypes.ts`
- Genres: `src/game/data/genres.ts`

## Save System

The game auto-saves to IndexedDB after each week and major action.

- Export: Settings → Export Save (downloads JSON)
- Import: Settings → Import Save (upload JSON)
- Save data includes RNG state for deterministic replays

## Simulation Loop

The weekly simulation (`src/game/engine/simulation.ts`) processes:

1. Stream calculations for all released songs
2. Revenue from streaming
3. Fan base growth/conversion
4. Hype decay
5. Career tier updates
6. Chart position updates
7. Random event generation
8. Label/show offer generation
9. NPC artist career updates
10. News generation
11. Milestone checks
12. Energy recovery

## Dev Tools

In development mode, a dev panel is available (gear icon → code icon):

- Add cash/followers/hype
- Skip weeks/months/years
- View current game state
- Export saves

## Testing

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch
```

Tests cover:
- Seeded RNG reproducibility
- Player creation and attributes
- Weekly simulation
- Action system
- Save serialization

## Architecture Notes

### Separation of Concerns

The simulation engine (`src/game/`) is completely independent of React. It:
- Uses pure TypeScript
- Has no React imports
- Can be run in Node.js for testing
- Could be wrapped for native mobile (Capacitor)

### State Management

Zustand store (`src/store/gameStore.ts`) bridges the simulation with React:
- Holds the GameState
- Exposes actions that call simulation functions
- Manages UI state (current screen, modals, etc.)

### Future Backend

Services are designed with interfaces that could be swapped for API calls:
- `saveGame()` → could POST to server
- `loadGame()` → could GET from server
- Events/content → could be fetched remotely

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **idb-keyval** - IndexedDB wrapper
- **Vitest** - Testing
- **PWA** - Offline support

## Mobile First

The UI is designed for ~390x844 phone screens:
- Bottom navigation
- Touch-friendly targets (min 44px)
- Swipeable sheets and modals
- Safe area handling

Desktop shows the mobile view centered with optional side panels.

## License

MIT
