# Sound Effects for FIFO Queue Visualization

This directory is for sound effects used in the FIFO Queue Visualization application.

## Current Implementation

The application is currently using direct URLs to sound files hosted online:

1. **Enqueue Sound**: A click sound from Pixabay
2. **Dequeue Sound**: A whoosh sound from Pixabay

These sounds are loaded directly from their source URLs in the `useSoundEffects.ts` hook.

## Alternative: Using Local Sound Files

If you prefer to use local sound files instead of the online ones:

1. Download suitable sound effects from websites like:
   - [Mixkit](https://mixkit.co/free-sound-effects/)
   - [Freesound](https://freesound.org/)
   - [ZapSplat](https://www.zapsplat.com/)
   - [Pixabay](https://pixabay.com/sound-effects/)

2. Rename the downloaded files to `enqueue.mp3` and `dequeue.mp3`

3. Place the files in this directory (`public/sounds/`)

4. Update the `useSoundEffects.ts` file to use local paths:
   ```typescript
   const enqueueAudio = new Audio('/sounds/enqueue.mp3');
   const dequeueAudio = new Audio('/sounds/dequeue.mp3');
   ```

## Recommended Sound Types

- For **enqueue**: Use a positive, upbeat sound like a "pop", "click", or "add" sound effect
- For **dequeue**: Use a different sound like a "whoosh", "swipe", or "remove" sound effect

Make sure the sound files are in MP3 format and are relatively short (less than 1 second) for the best user experience. 