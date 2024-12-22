class Piece {
    static get PIECES() {
        return {
            'T': {
                matrix: [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                color: '#FF0D72'
            },
            'O': {
                matrix: [
                    [2, 2],
                    [2, 2]
                ],
                color: '#0DC2FF'
            },
            'S': {
                matrix: [
                    [0, 3, 3],
                    [3, 3, 0],
                    [0, 0, 0]
                ],
                color: '#0DFF72'
            },
            'Z': {
                matrix: [
                    [4, 4, 0],
                    [0, 4, 4],
                    [0, 0, 0]
                ],
                color: '#F538FF'
            },
            'J': {
                matrix: [
                    [5, 0, 0],
                    [5, 5, 5],
                    [0, 0, 0]
                ],
                color: '#FF8E0D'
            },
            'L': {
                matrix: [
                    [0, 0, 6],
                    [6, 6, 6],
                    [0, 0, 0]
                ],
                color: '#FFE138'
            },
            'I': {
                matrix: [
                    [0, 0, 0, 0],
                    [7, 7, 7, 7],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#3877FF'
            }
        };
    }

    static getRandomPiece() {
        const pieces = Object.keys(this.PIECES);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            matrix: JSON.parse(JSON.stringify(this.PIECES[type].matrix)),
            color: this.PIECES[type].color,
            type: type
        };
    }

    static rotate(matrix, direction = 1) {
        const N = matrix.length;
        const rotated = matrix.map(row => [...row]);
        
        // Transpose matrix
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < i; j++) {
                [rotated[i][j], rotated[j][i]] = [rotated[j][i], rotated[i][j]];
            }
        }
        
        // Reverse rows for clockwise, columns for counter-clockwise
        if (direction > 0) {
            rotated.forEach(row => row.reverse());
        } else {
            rotated.reverse();
        }
        
        return rotated;
    }

    static getInitialPosition(matrix, boardWidth) {
        return {
            x: Math.floor(boardWidth / 2) - Math.floor(matrix[0].length / 2),
            y: 0
        };
    }
}
