const points = [8];
// const points = [4, 8, 12, 16, 20];
let allKeys = [];
const origins = {};
const noteToPlay = {};

let letterNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const sampler = new Tone.Sampler({
  urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      A6: "A6.mp3",
      C7: "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      A7: "A7.mp3",
      C8: "C8.mp3"
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();
const synth1 = new Tone.Synth().toDestination();
const synth2 = new Tone.MembraneSynth().toDestination();
const synth3 = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	}
}).toDestination();

export const drawHand = (results, ctx, ctxVideo, w, h) => {
  // Loop through each prediction
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctxVideo.clearRect(0, 0, w, h);
  ctxVideo.drawImage(results.image, 0, 0, w, h);
  const rH = results?.rightHandLandmarks || [];
  const lH = results?.leftHandLandmarks || [];
  const hands = [rH, lH];
  let allPoints = {};
  hands.forEach((hand, i) => {
    // Loop through fingers
    if (hand.length) {
      points.forEach(point => {
        allPoints[`${i}_${point}`] = {};

        const x = hand[point].x * w;
        // Get y point
        const y = hand[point].y * h;
        // Start drawing

        ctx.beginPath();
        const radius = 8; //(Math.abs(hand[point].z.toFixed(2) * w))/12;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        // Set line color
        ctx.fillStyle = radius > 7 ? 'red' : 'gold';
        // if (radius > 7.5) {
          allPoints[`${i}_${point}`] = { x, y, i, point };
        // }
        ctx.fill();
      });
    }
  });
  if (Object.values(allPoints).length) {
    checkTouch(allPoints);
  }
  ctx.restore();
};
export const checkTouch = (allPoints) =>  {
  allKeys.forEach(k => {
    const letterNote = k.getAttribute('letter-note');
    let activate = false;
    Object.values(allPoints).forEach(p => {
      const bBox = k.getBoundingClientRect();
      if (p.x > bBox.x - origins.x && p.x < bBox.x - origins.x + bBox.width &&
          p.y > bBox.y - origins.y && p.y < bBox.y - origins.y + bBox.height) {
        activate = true;
        if (k.classList.contains('tone') && p.y < bBox.y - origins.y + 100) {
          activate = false;
        }
      }
    })
    if (activate) {
      if (!noteToPlay[letterNote].active) {
        k.classList.add('key-active');
        noteToPlay[letterNote].active = true;
        playNote(k);
      }
    } else {
      k.classList.remove('key-active');
      noteToPlay[letterNote].active = false;
    }
  });
}

// -------------------------------------------------------------------------

export const drawOctave = (octaveIndex, originX, originY) => {

  console.log(octaveIndex);

  origins.x = originX;
  origins.y = originY;

  const piano = document.getElementById('piano');

  const octave = document.createElement('div');
  octave.classList.add('octave');
  piano.appendChild(octave);

  const tones = document.createElement('div');
  tones.classList.add('octave-tones');
  octave.appendChild(tones);

  const semitones = document.createElement('div');
  semitones.classList.add('octave-semitones');
  octave.appendChild(semitones);

  const semiTonesIndex = [1, 3, 6, 8, 10];

  for (let i=0; i<letterNotes.length; i++) {
    const toneDiv = document.createElement('div');
    const letterN = `${letterNotes[i]}${octaveIndex + 3}`;
    toneDiv.setAttribute('letter-note', letterN);

    toneDiv.addEventListener('click', () => playNote(toneDiv));

    if (semiTonesIndex.includes(i)) {
      toneDiv.classList.add('semitone');
      semitones.appendChild(toneDiv);
    } else {
      toneDiv.classList.add('tone');
      tones.appendChild(toneDiv);
    }

    allKeys.push(toneDiv);
    noteToPlay[letterN] = { letterN };
  }
}

const playNote = toneDiv => {
  const note = toneDiv.getAttribute('letter-note');
  console.log(note);
  synth3.triggerAttackRelease(note, '8n');
}