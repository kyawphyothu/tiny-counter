# Tiny Tally - Buddhist Bead Counter App

A minimalist digital counter app designed for **Tiny (Thant Htet Htet Nyein)** to assist with Buddhist meditation and prayer bead counting (ပုတီးစိတ်).

## About

This app serves as a digital alternative to traditional Buddhist prayer beads (mala/rosary), helping practitioners keep count during meditation, mantra recitation, and spiritual practices. The clean, distraction-free interface allows for focused spiritual practice.

## Features

- **Tap Anywhere Counting**: Simply tap the screen to increment the counter
- **Customizable Limit**: Set your target count (default: 108 - traditional Buddhist mala count)
- **Haptic Feedback**: Phone vibrates when you reach your target count
- **Persistent Storage**: Your count and settings are automatically saved
- **Dark Theme**: Smooth black background with white text for comfortable use
- **Correction Tools**: 
  - Minus button for accidental taps
  - Reset button to start over
- **Mobile Optimized**: Designed for touch devices with large, accessible buttons

## How to Use

1. **Set Your Limit**: Tap the ⚙️ settings button to set your target count (traditional Buddhist practice uses 108)
2. **Start Counting**: Tap anywhere on the screen to increment the counter
3. **Reach Your Goal**: The phone will vibrate when you reach your limit
4. **Corrections**: Use the "-" button if you accidentally tap, or "Reset" to start over
5. **Continue**: Your progress is automatically saved, even if you close the app

## Buddhist Context

In Buddhist tradition, 108 is considered a sacred number representing:
- 108 defilements to overcome
- 108 beads on a traditional mala
- Various spiritual significances in Buddhist cosmology

This digital counter honors that tradition while providing the convenience of modern technology for meditation practice.

## Quick Start

### Using Docker (Recommended)

The easiest way to run Tiny Tally is using Docker Compose. **No manual building required!**

```bash
# Clone the repository
git clone https://github.com/kyawphyothu/tiny-counter.git
cd tiny-counter

# Run in development mode (automatically builds and starts)
docker-compose up tiny-tally-dev

# Or run in production mode (automatically builds and starts)
docker-compose up tiny-tally-prod
```

**Access the app:**
- Development: http://localhost:3000
- Production: http://localhost:4173

#### Docker Compose Commands

```bash
# Start containers (builds if needed)
docker-compose up tiny-tally-dev              # Foreground mode (see logs)
docker-compose up -d tiny-tally-dev           # Background mode (detached)

# Start existing stopped containers (faster, no rebuild)
docker-compose start tiny-tally-dev

# Stop running containers (keeps containers)
docker-compose stop tiny-tally-dev

# Stop and remove containers, networks (clean slate)
docker-compose down

# View logs (useful when running in background)
docker-compose logs -f tiny-tally-dev

# Restart containers
docker-compose restart tiny-tally-dev

# Force rebuild and start
docker-compose up --build tiny-tally-dev
```

#### Typical Workflow

```bash
# First time or after changes
docker-compose up tiny-tally-dev

# Press Ctrl+C to stop

# Next time - same command works
docker-compose up tiny-tally-dev

# Or run in background
docker-compose up -d tiny-tally-dev

# Stop background container
docker-compose stop tiny-tally-dev

# Clean everything
docker-compose down
```

### Using Manual Docker Commands (Advanced)

If you want to understand the build process step-by-step:

```bash
# Development
docker build -f Dockerfile.dev -t tiny-tally-dev .
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules tiny-tally-dev

# Production
docker build -t tiny-tally-prod .
docker run -p 4173:4173 tiny-tally-prod
```

### Traditional Setup

If you prefer to run without Docker:

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Configuration

- **Node Version**: 22.17.0 Alpine
- **Development Port**: 3000 (with hot reload)
- **Production Port**: 4173 (optimized build)
- **Volume Mounting**: Development mode includes live code changes

## Technical Details

Built with React + TypeScript + Vite for a fast, responsive experience.
