# Aerones case study

To get this up and running:

- Clone the project
- Add stitched video in /public/video with file name "stitchedVideo.mp4"
- npm run dev. For me it runs on port 5173 - http://localhost:5173/

User controls:

- zoom in / out; rotate camera
- rewind 15s / 5s / 1 frame
- play / pause
- forward 1 frame / 5s / 15s

When forwarding / rewinding, video stops, so need to hit play again.

Info displayed

- time in hh:mm:ss
- frame

Assumptions made:

- fps = 3. Basing on data - frame 102 with time 00:34 and frame 105 with time 00:35
- current frame - knowing playback time and fps we can calculate the frame to match logic in data file. Getting it from three.js would require greater deepdive into all of this.
