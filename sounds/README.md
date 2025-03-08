# Sound Effects for FIFO Queue Visualization

This directory is for sound effects used in the FIFO Queue Visualization application.

## Current Implementation

The application is currently using direct URLs to simple click sounds hosted online:

1. **Enqueue Sound**: A simple click sound from SoundJay (less than 1 second)
2. **Dequeue Sound**: A simple pop sound from SoundJay (less than 1 second)

These sounds are loaded directly from their source URLs in the `useSoundEffects.ts` hook:
```typescript
const enqueueAudio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
const dequeueAudio = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
```

## Using Local Sound Files (Alternative)

If you prefer to use local sound files instead of the online ones:

1. Download suitable sound effects from websites like:
   - [SoundJay](https://www.soundjay.com/buttons/index.html) - Simple button sounds
   - [Mixkit](https://mixkit.co/free-sound-effects/click/) - Great for click sounds
   - [Freesound](https://freesound.org/search/?q=click) - Many free click sounds
   - [ZapSplat](https://www.zapsplat.com/sound-effect-categories/clicks-and-taps/) - High-quality click sounds

2. Rename the downloaded files to `enqueue.mp3` and `dequeue.mp3`

3. Replace the existing files in this directory (`public/sounds/`)

4. Update the `useSoundEffects.ts` file to use local paths:
   ```typescript
   const enqueueAudio = new Audio('/sounds/enqueue.mp3');
   const dequeueAudio = new Audio('/sounds/dequeue.mp3');
   ```

## Recommended Sound Types

- For **enqueue**: Use a simple, crisp click sound (less than 5 seconds)
- For **dequeue**: Use a different sound like a pop or soft click (less than 5 seconds)

Keep the sounds short and subtle to avoid distracting from the user experience. The current implementation uses sounds that are less than 1 second in length, which is ideal for UI interactions. 