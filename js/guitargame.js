document.addEventListener('DOMContentLoaded', () => {
    const currentChordDisplay = document.getElementById('current-chord');
    const fretboard = document.querySelector('.fretboard');
    
    // --- Configuration ---
    const TOTAL_FRETS = 14;
    const FRETBOARD_WIDTH = 800; // Must match CSS --fretboard-width
    const NUT_WIDTH = 8; // Must match CSS .fret.nut
    const NUM_STRINGS = 6;
    const MARKER_SIZE = 25; 

    // Calculate Fret Positions (using the "18 rule" for a more realistic look)
    const FRET_POSITIONS = calculateFretPositions(TOTAL_FRETS, FRETBOARD_WIDTH, NUT_WIDTH);
    
    // Generate Fret Lines and Dots
    generateFretboardVisuals();
    
    // --- 1. CHORD SHAPES MAP ---
    // Each entry holds an ARRAY of possible shapes. 
    // Format for each shape: [Root Fret, Low E, A, D, G, B, High E]
    // The Root Fret determines the shift (0 for open/nut).
    // 'x' = Mute, '0' = Open string.
    const CHORD_SHAPES = {
        'Cmaj': [
            { rootFret: 0, frets: ['x', 3, 2, 0, 1, 0] },
            { rootFret: 8, frets: ['x', 15, 14, 12, 12, 12] },
            { rootFret: 3, frets: [8, 10, 10, 9, 8, 8] } 
        ],
        'C7': [
            { rootFret: 0, frets: ['x', 3, 2, 3, 1, 0] },
            { rootFret: 8, frets: ['x', 15, 14, 12, 12, 11] }
        ],
        'Cm': [
            { rootFret: 0, frets: ['x', 3, 5, 5, 4, 3] },
            { rootFret: 8, frets: ['x', 15, 14, 12, 13, 12] },
            { rootFret: 3, frets: [8, 10, 10, 8, 8, 8] } 
        ],
        'Cm7': [
            { rootFret: 0, frets: ['x', 3, 5, 3, 4, 3] },
            { rootFret: 8, frets: ['x', 15, 14, 12, 13, 11] }
        ],
        'Cmaj7': [
            { rootFret: 0, frets: ['x', 3, 2, 0, 0, 0] },
            { rootFret: 3, frets: ['x', 3, 5, 4, 5, 3] },
            { rootFret: 8, frets: ['x', 15, 14, 12, 12, 11] } 
        ],

        'Dmaj': [
            { rootFret: 0, frets: ['x', 'x', 0, 2, 3, 2] },
            { rootFret: 5, frets: ['x', 12, 11, 9, 9, 9] },
            { rootFret: 2, frets: [9, 11, 11, 10, 9, 9] }
        ],
        'D7': [
            { rootFret: 0, frets: ['x', 'x', 0, 2, 1, 2] },
            { rootFret: 5, frets: ['x', 12, 11, 9, 9, 8] }
        ],
        'Dm': [
            { rootFret: 0, frets: ['x', 'x', 0, 2, 3, 1] },
            { rootFret: 5, frets: ['x', 12, 11, 9, 10, 9] },
            { rootFret: 2, frets: [9, 11, 11, 9, 9, 9] }
        ],
        'Dm7': [
            { rootFret: 0, frets: ['x', 'x', 0, 2, 1, 1] },
            { rootFret: 5, frets: ['x', 12, 11, 9, 10, 8] }
        ],
        'Dmaj7': [
            { rootFret: 0, frets: ['x', 'x', 0, 2, 2, 2] },
            { rootFret: 5, frets: ['x', 12, 11, 9, 9, 8] }
        ],

        'Emaj': [
            { rootFret: 0, frets: [0, 2, 2, 1, 0, 0] },
            { rootFret: 7, frets: ['x', 14, 13, 11, 11, 11] },
            { rootFret: 4, frets: [11, 13, 13, 12, 11, 11] }
        ],
        'E7': [
            { rootFret: 0, frets: [0, 2, 2, 1, 3, 0] },
            { rootFret: 7, frets: ['x', 14, 13, 11, 11, 10] }
        ],
        'Em': [
            { rootFret: 0, frets: [0, 2, 2, 0, 1, 0] },
            { rootFret: 7, frets: ['x', 14, 13, 11, 12, 11] },
            { rootFret: 4, frets: [11, 13, 13, 11, 11, 11] }
        ],
        'Em7': [
            { rootFret: 0, frets: [0, 2, 2, 0, 1, 3] },
            { rootFret: 7, frets: ['x', 14, 13, 11, 12, 10] }
        ],
        'Emaj7': [
            { rootFret: 0, frets: [0, 2, 1, 1, 0, 0] },
            { rootFret: 7, frets: ['x', 14, 13, 11, 11, 10] }
        ],

        'Fmaj': [
            { rootFret: 1, frets: [1, 3, 3, 2, 1, 1] },
            { rootFret: 8, frets: ['x', 15, 14, 13, 12, 12] }
        ],
        'F7': [
            { rootFret: 1, frets: [1, 3, 3, 2, 1, 3] },
            { rootFret: 8, frets: ['x', 15, 14, 13, 12, 11] }
        ],
        'Fm': [
            { rootFret: 1, frets: [1, 3, 3, 1, 1, 1] },
            { rootFret: 8, frets: ['x', 15, 14, 13, 13, 12] }
        ],
        'Fm7': [
            { rootFret: 1, frets: [1, 3, 3, 1, 1, 3] },
            { rootFret: 8, frets: ['x', 15, 14, 13, 13, 11] }
        ],
        'Fmaj7': [
            { rootFret: 1, frets: [1, 3, 3, 2, 1, 0] }
        ],

        'Gmaj': [
            { rootFret: 0, frets: [3, 2, 0, 0, 0, 3] },
            { rootFret: 3, frets: [3, 5, 5, 4, 3, 3] },
            { rootFret: 10, frets: ['x', 'x', 12, 12, 12, 12] }
        ],
        'G7': [
            { rootFret: 0, frets: [3, 2, 0, 0, 0, 1] },
            { rootFret: 3, frets: [3, 5, 5, 4, 3, 2] }
        ],
        'Gm': [
            { rootFret: 0, frets: [3, 5, 5, 3, 4, 3] },
            { rootFret: 3, frets: [3, 5, 5, 3, 3, 3] },
            { rootFret: 10, frets: ['x', 'x', 12, 12, 13, 12] }
        ],
        'Gm7': [
            { rootFret: 0, frets: [3, 5, 3, 3, 4, 3] },
            { rootFret: 3, frets: [3, 5, 5, 3, 3, 2] }
        ],
        'Gmaj7': [
            { rootFret: 0, frets: [3, 2, 0, 0, 0, 2] },
            { rootFret: 3, frets: [3, 5, 5, 4, 3, 2] }
        ],

        'Amaj': [
            { rootFret: 0, frets: [0, 0, 2, 2, 2, 0] },
            { rootFret: 5, frets: ['x', 'x', 9, 11, 12, 11] },
            { rootFret: 12, frets: ['x', 'x', 1, 3, 4, 3] }
        ],
        'A7': [
            { rootFret: 0, frets: [0, 0, 2, 0, 2, 0] },
            { rootFret: 5, frets: ['x', 'x', 9, 11, 12, 10] }
        ],
        'Am': [
            { rootFret: 0, frets: [0, 0, 2, 2, 1, 0] },
            { rootFret: 5, frets: ['x', 'x', 9, 11, 13, 11] },
            { rootFret: 12, frets: ['x', 'x', 1, 3, 3, 3] }
        ],
        'Am7': [
            { rootFret: 0, frets: [0, 0, 2, 0, 1, 0] },
            { rootFret: 5, frets: ['x', 'x', 9, 11, 13, 10] }
        ],
        'Amaj7': [
            { rootFret: 0, frets: [0, 0, 2, 1, 2, 0] },
            { rootFret: 5, frets: ['x', 'x', 9, 11, 12, 10] }
        ],

        'Bmaj': [
            { rootFret: 2, frets: [2, 4, 4, 3, 2, 2] },
            { rootFret: 9, frets: ['x', 'x', 11, 13, 14, 13] }
        ],
        'B7': [
            { rootFret: 2, frets: [2, 4, 4, 3, 2, 0] },
            { rootFret: 9, frets: ['x', 'x', 11, 13, 14, 12] }
        ],
        'Bm': [
            { rootFret: 2, frets: [2, 4, 4, 2, 3, 2] },
            { rootFret: 9, frets: ['x', 'x', 11, 13, 14, 12] }
        ],
        'Bm7': [
            { rootFret: 2, frets: [2, 4, 2, 2, 3, 2] },
            { rootFret: 9, frets: ['x', 'x', 11, 13, 14, 11] }
        ],
        'Bmaj7': [
            { rootFret: 2, frets: [2, 4, 3, 3, 2, 2] },
            { rootFret: 9, frets: ['x', 'x', 11, 13, 14, 12] }
        ],
    };

    // --- 2. FRETBOARD GENERATION ---
    // Creates the visual fret lines and dot markers based on the calculated positions.
    function calculateFretPositions(totalFrets, width, nut) {
        let positions = [0]; // Nut position
        let currentPos = nut;
        let scaleLength = width - nut; 

        // Simplified proportional calculation: Fret width decreases by ~5.6%
        for (let i = 1; i <= totalFrets; i++) {
            // Fret Spacing Formula: Distance = ScaleLength / 17.817
            let distanceToNext = scaleLength / 17.817; 
            currentPos += distanceToNext;
            positions.push(currentPos);
            scaleLength -= distanceToNext;
        }
        return positions;
    }

    function generateFretboardVisuals() {
        // Clear old frets/dots
        fretboard.querySelectorAll('.fret, .fret-dot').forEach(el => el.remove());

        // Generate Fret Lines
        FRET_POSITIONS.forEach((pos, index) => {
            if (index === FRET_POSITIONS.length - 1) return; // Skip last position for line
            
            const fret = document.createElement('div');
            fret.classList.add('fret');
            if (index === 0) {
                fret.classList.add('nut');
            } else {
                // Fret line position is the start of the next fret space
                fret.style.left = `${pos - 3}px`; // -3px for half the line width
            }
            fretboard.appendChild(fret);
        });

        // Generate Fret Dots (Single dots: 3, 5, 7, 9, 15... Double dot: 12)
        const dotFrets = [3, 5, 7, 9, 12];
        dotFrets.forEach(fretNum => {
            const dot = document.createElement('div');
            dot.classList.add('fret-dot');
            
            // Calculate center of the fret space
            const centerPos = (FRET_POSITIONS[fretNum] + FRET_POSITIONS[fretNum - 1]) / 2;

            if (fretNum === 12) {
                // Double dot at the 12th fret
                const dot1 = dot.cloneNode();
                dot1.style.left = `${centerPos - 20}px`;
                fretboard.appendChild(dot1);
                
                const dot2 = dot.cloneNode();
                dot2.style.left = `${centerPos + 20}px`;
                fretboard.appendChild(dot2);
            } else {
                dot.style.left = `${centerPos}px`;
                fretboard.appendChild(dot);
            }
        });
    }


    // --- 3. KEYBOARD STATE TRACKER ---
    let keysPressed = {};
    const trackedKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'm', ' ', '7', '1', '2', '3', '4', '5', '6', '8', '9', '0'];

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === ' ') e.preventDefault();
        
        if (trackedKeys.includes(key)) {
            keysPressed[key] = true;
        }

        updateChord();
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        
        if (trackedKeys.includes(key)) {
            keysPressed[key] = false;
        }

        updateChord();
    });

    // --- 4. CHORD LOGIC ---
    function updateChord() {
        const rootKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        let root = rootKeys.find(k => keysPressed[k]);

        if (!root) {
            currentChordDisplay.textContent = 'Press a key (A-G) to start...';
            clearFretboard();
            return;
        }

        root = root.toUpperCase();
        let chordType = 'maj'; // Default to Major
        let displayChordName = root;
        
        const isMinor = keysPressed['m'];
        const isDominant7 = keysPressed['7'];
        const isMajor7 = keysPressed[' '];
        
        // 1. Determine Chord Type (Priority: combinations matter)
        if (isMinor && isDominant7) {
            // m + 7 = minor 7th
            chordType = 'm7';
            displayChordName = root + 'm7';
        } else if (isMajor7 && isDominant7) {
            // space + 7 = major 7th
            chordType = 'maj7';
            displayChordName = root + 'maj7';
        } else if (isMinor) {
            // m alone = minor
            chordType = 'm';
            displayChordName = root + 'm';
        } else if (isDominant7) {
            // 7 alone = dominant 7th
            chordType = '7';
            displayChordName = root + '7';
        } else if (isMajor7) {
            // space alone = major 7th
            chordType = 'maj7';
            displayChordName = root + 'maj7';
        }

        let lookupChordName = root + chordType;
        currentChordDisplay.textContent = displayChordName;
        
        // Apply the visual shape
        displayChordShape(lookupChordName);
    }
    
    // --- 5. FRETBOARD DISPLAY ---
    function clearFretboard() {
        // Remove all previous markers/fingering
        fretboard.querySelectorAll('.note-marker, .mute-marker, .open-marker').forEach(marker => marker.remove());
    }

    function displayChordShape(lookupName) {
        clearFretboard();

        const possibleShapes = CHORD_SHAPES[lookupName];
        if (!possibleShapes || possibleShapes.length === 0) {
            currentChordDisplay.textContent += ' (Shape Not Found)';
            return;
        }

        // Use only the first (most common) chord shape
        const { rootFret, frets } = possibleShapes[0];
        
        // String positions (top to bottom, center of the string) - INVERTED so high E is at top
        const STRING_CENTERS = [165, 135, 105, 75, 45, 15]; 

        // Iterate through all 6 strings
        frets.forEach((fret, index) => {
            const stringCenterY = STRING_CENTERS[index];
            const fingerMarker = document.createElement('div');
            
            // --- Muted String 'x' ---
            if (fret === 'x') {
                const muteMarker = document.createElement('div');
                muteMarker.classList.add('mute-marker');
                muteMarker.textContent = 'X';
                
                // Position the 'X' marker slightly above the nut/1st fret area
                const posX = (FRET_POSITIONS[1] - NUT_WIDTH) / 2; 
                muteMarker.style.left = `${posX}px`;
                fretboard.appendChild(muteMarker);
                return;
            }

            fret = parseInt(fret, 10);

            // --- Open String '0' ---
            if (fret === 0) {
                const openMarker = document.createElement('div');
                openMarker.classList.add('open-marker');
                openMarker.textContent = 'O';

                // Position the 'O' marker slightly above the string center
                const posX = (FRET_POSITIONS[1] - NUT_WIDTH) / 2; 
                openMarker.style.left = `${posX}px`;
                openMarker.style.top = `${stringCenterY}px`; 
                fretboard.appendChild(openMarker);
                return;
            }
            
            // --- Fretted Note (1-14) ---
            
            // Adjust fret number for shapes that start up the neck (e.g., C on fret 8)
            const actualFret = fret; 
            if (actualFret > TOTAL_FRETS) {
                // If the required fret is beyond the visible 14 frets, skip it for this display
                console.log(`Fret ${actualFret} is out of 14-fret range.`);
                return;
            }
            
            fingerMarker.classList.add('note-marker');

            // Find the center position for the calculated fret space
            const fretStartPos = FRET_POSITIONS[actualFret - 1]; 
            const fretEndPos = FRET_POSITIONS[actualFret];
            const leftPosition = (fretStartPos + fretEndPos) / 2;

            fingerMarker.style.top = `${stringCenterY}px`;
            fingerMarker.style.left = `${leftPosition}px`;
            fretboard.appendChild(fingerMarker);
        });
    }
    
    // Initial generation call
    generateFretboardVisuals();
});
