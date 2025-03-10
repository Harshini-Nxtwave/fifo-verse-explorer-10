# Sound Effects for FIFO Queue Visualization

This directory contains sound effects used in the FIFO Queue Visualization application.

## Current Implementation

The application is currently using local sound files:

1. **enque-sound.mp3**: A simple click sound played when adding an item to the queue
2. **deque-sound.mp3**: A simple click sound played when removing an item from the queue

These sound files are located in this directory and are loaded in the `useSoundEffects.ts` hook.

## Customizing Sound Effects

If you want to change the sound effects:

1. Download suitable sound effects from websites like:
   - [Mixkit](https://mixkit.co/free-sound-effects/click/) - Great for click sounds
   - [Freesound](https://freesound.org/search/?q=click) - Many free click sounds
   - [ZapSplat](https://www.zapsplat.com/sound-effect-categories/clicks-and-taps/) - High-quality click sounds
   - [Pixabay](https://pixabay.com/sound-effects/search/click/) - Royalty-free click sounds
   - [SoundJay](https://www.soundjay.com/buttons/index.html) - Simple button sounds

2. Replace the existing files in this directory or add new sound files

3. Update the `useSoundEffects.ts` file to use your new sound files:
   ```typescript
   const enqueueAudio = new Audio('/sounds/your-new-enqueue-sound.mp3');
   const dequeueAudio = new Audio('/sounds/your-new-dequeue-sound.mp3');
   ```

## Recommended Sound Types

- For **enqueue**: Use a simple, crisp click sound (less than 5 seconds)
- For **dequeue**: Use a different sound like a pop or soft click (less than 5 seconds)

Keep the sounds short and subtle to avoid distracting from the user experience. Simple click sounds that are less than 5 seconds in length are ideal for UI interactions. 