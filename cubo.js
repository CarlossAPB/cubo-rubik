function ObjectRotator(htmlElement, degMagnitude) {
	this.previousTransform = "";
	this.htmlElement = htmlElement;
	this.degMagnitude = degMagnitude;
	this.degX = 0;
	this.degY = 0;
	this.degZ = 0;

	this.rotate = function () {
		this.htmlElement.style.transform =
			this.previousTransform +
			` rotate3d(1, 0, 0, ${this.degX}deg) rotate3d(0, 1, 0, ${this.degY}deg) rotate3d(0, 0, 1, ${this.degZ}deg)`;
	};

	this.rotateMatrix = function (degX, degY, degZ) {
		const oldMatrix = new WebKitCSSMatrix(
			this.htmlElement.style.webkitTransform
		);
		const extrarotate = new WebKitCSSMatrix().rotate(degX, degY, degZ);
		const final = extrarotate.multiply(oldMatrix);
		const finalstring = Array.from({ length: 16 }, (_, i) => {
			const j = Math.floor(i / 4) + 1;
			const k = (i % 4) + 1;
			if (j === 4 && (k === 1 || k === 2 || k === 3)) {
				final[`m${j}${k}`] = 0;
			}
			return Math.round(final[`m${j}${k}`]);
		});
		this.htmlElement.style.webkitTransform = `${
			this.previousTransform
		} matrix3d(${finalstring.join(",")})`;
	};

	this.rotateByMatrix = function (degX, degY, degZ) {
		this.rotateMatrix(degX, degY, degZ);
	};

	this.rotateBy = function (degX, degY, degZ = 0) {
		this.degX += degX;
		this.degY += degY;
		this.degZ += degZ;
		this.rotate();
	};

	this.setRotationAngles = function (degX, degY, degZ = 0) {
		this.degX = degX;
		this.degY = degY;
		this.degZ = degZ;
		this.rotate();
	};
}

function CubeSystem(cube) {
	this.cube = cube;
	this.faces = ["red", "blue", "orange", "green", "white", "yellow"];
	this.miniCubeObjectRotators = {};

	this.generateCubeSquares = function () {
		[0, 1, 2].forEach((i) => {
			[0, 1, 2].forEach((j) => {
				[0, 1, 2].forEach((k) => {
					const miniCube = document.createElement("div");
					miniCube.className = "cubo square mini-cubo";
					this.faces.forEach((face) => {
						const childFace = document.createElement("div");
						childFace.className = "cara " + face;
						miniCube.appendChild(childFace);
					});
					miniCube.style.position = "absolute";
					miniCube.style.left = `${k * 60}px`;
					miniCube.style.top = `${j * 60}px`;
					miniCube.style.transform = `translateZ(${-i * 60}px)`;
					this.cube.appendChild(miniCube);
					const miniCubeObjectRotator = {
						objectRotator: new ObjectRotator(miniCube, 90),
					};
					miniCubeObjectRotator.objectRotator.previousTransform =
						miniCube.style.transform;
					this.miniCubeObjectRotators[`m${i}${j}${k}`] =
						miniCubeObjectRotator;
				});
			});
		});
	};
	this.rotateSquares = function (faceLetter, direction) {
		const miniCubes = Object.keys(this.miniCubeObjectRotators)
			.filter((key) => {
				const [, mArray, mRow, mCol] = key;
				switch (faceLetter) {
					case "F":
						return mArray == 0;
					case "B":
						return mArray == 2;
					case "L":
						return mCol == 0;
					case "R":
						return mCol == 2;
					case "U":
						return mRow == 0;
					case "D":
						return mRow == 2;
					default:
						return false;
				}
			})
			.map((key) => key);
		const previousMiniCubes = {
			F: [
				[0, 2, 0],
				[0, 1, -1],
				[0, 0, -2],
				[0, 1, 1],
				[0, 0, 0],
				[0, -1, -1],
				[0, 0, 2],
				[0, -1, 1],
				[0, -2, 0],
			],
			B: [
				[0, 0, 2],
				[0, 1, 1],
				[0, 2, 0],
				[0, -1, 1],
				[0, 0, 0],
				[0, 1, -1],
				[0, -2, 0],
				[0, -1, -1],
				[0, 0, -2],
			],
			L: [
				[2, 0, 0],
				[1, -1, 0],
				[0, -2, 0],
				[1, 1, 0],
				[0, 0, 0],
				[-1, -1, 0],
				[0, 2, 0],
				[-1, 1, 0],
				[-2, 0, 0],
			],
			R: [
				[0, 2, 0],
				[1, 1, 0],
				[2, 0, 0],
				[-1, 1, 0],
				[0, 0, 0],
				[1, -1, 0],
				[-2, 0, 0],
				[-1, -1, 0],
				[0, -2, 0],
			],
			U: [
				[0, 0, 2],
				[1, 0, 1],
				[2, 0, 0],
				[-1, 0, 1],
				[0, 0, 0],
				[1, 0, -1],
				[-2, 0, 0],
				[-1, 0, -1],
				[0, 0, -2],
			],
			D: [
				[2, 0, 0],
				[1, 0, -1],
				[0, 0, -2],
				[1, 0, 1],
				[0, 0, 0],
				[-1, 0, -1],
				[0, 0, 2],
				[-1, 0, 1],
				[-2, 0, 0],
			],
		};

		let finalLetter = faceLetter;

		const oppositeFaces = {
			F: "B",
			B: "F",
			L: "R",
			R: "L",
			U: "D",
			D: "U",
		};

		if (oppositeFaces[faceLetter]) {
			finalLetter =
				direction > 0 ? faceLetter : oppositeFaces[faceLetter];
		}

		const previousStyles = {};

		miniCubes.forEach((key, idx) => {
			const cube = this.miniCubeObjectRotators[key];
			const [, mArray, mRow, mCol] = key;
			const previousKey =
				"m" +
				(+mArray + previousMiniCubes[finalLetter][idx][0]) +
				(+mRow + previousMiniCubes[finalLetter][idx][1]) +
				(+mCol + previousMiniCubes[finalLetter][idx][2]);
			const previousMiniCube =
				this.miniCubeObjectRotators[previousKey].objectRotator
					.htmlElement;

			previousStyles[key] =
				cube.objectRotator.htmlElement.style.webkitTransform;

			cube.objectRotator.htmlElement.style.webkitTransform =
				previousStyles[previousKey] ||
				previousMiniCube.style.webkitTransform;

			switch (faceLetter) {
				case "F":
					cube.objectRotator.rotateByMatrix(0, 0, 90 * direction);
					break;
				case "B":
					cube.objectRotator.rotateByMatrix(0, 0, -90 * direction);
					break;
				case "R":
					cube.objectRotator.rotateByMatrix(90 * direction, 0, 0);
					break;
				case "L":
					cube.objectRotator.rotateByMatrix(-90 * direction, 0, 0);
					break;
				case "D":
					cube.objectRotator.rotateByMatrix(0, 90 * direction, 0);
					break;
				case "U":
					cube.objectRotator.rotateByMatrix(0, -90 * direction, 0);
					break;
			}
		});
	};
	this.mixCube = function (movesNum) {
		const movesMade = [];
		const possibleMoves = [
			["U", 1],
			["U", -1],
			["D", 1],
			["D", -1],
			["F", 1],
			["F", -1],
			["B", 1],
			["B", -1],
			["L", 1],
			["L", -1],
			["R", 1],
			["R", -1],
		];
		for (let i = 0; i < movesNum; i++) {
			setTimeout(() => {
				const randomIndex = Math.floor(
					Math.random() * possibleMoves.length
				);
				const randomMove = possibleMoves[randomIndex];
				this.rotateSquares(randomMove[0], randomMove[1]);
				movesMade.push(randomMove);
			}, i * 100);
		}
		setTimeout(() => {
			movesMade.reverse().forEach((move, i) => {
				setTimeout(() => {
					this.rotateSquares(move[0], -move[1]);
				}, i * 100);
			});
		}, movesNum * 100);
	};
	this.beforeTurningFace = function () {};
	this.init = function () {
		this.generateCubeSquares();
	};
	this.makeU = function () {
		this.rotateSquares("U", 1);
	};
	this.makeUInverse = function () {
		this.rotateSquares("U", -1);
	};
	this.makeD = function () {
		this.rotateSquares("D", 1);
	};
	this.makeDInverse = function () {
		this.rotateSquares("D", -1);
	};
	this.makeL = function () {
		this.rotateSquares("L", 1);
	};
	this.makeLInverse = function () {
		this.rotateSquares("L", -1);
	};
	this.makeR = function () {
		this.rotateSquares("R", 1);
	};
	this.makeRInverse = function () {
		this.rotateSquares("R", -1);
	};
	this.makeF = function () {
		this.rotateSquares("F", 1);
	};
	this.makeFInverse = function () {
		this.rotateSquares("F", -1);
	};
	this.makeB = function () {
		this.rotateSquares("B", 1);
	};
	this.makeBInverse = function () {
		this.rotateSquares("B", -1);
	};
	this.init();
}

const cube = document.getElementById("cube");
const objectRotator = new ObjectRotator(cube, 45);
const cubeSystem = new CubeSystem(cube);
objectRotator.setRotationAngles(-45, -45);
cubeSystem.mixCube(30);

addEventListener("keydown", function (ev) {
	if (!ev.ctrlKey) {
		switch (ev.code) {
			case "KeyD":
				objectRotator.rotateBy(0, objectRotator.degMagnitude);
				break;
			case "KeyA":
				objectRotator.rotateBy(0, -objectRotator.degMagnitude);
				break;
			case "KeyW":
				objectRotator.rotateBy(objectRotator.degMagnitude, 0);
				break;
			case "KeyS":
				objectRotator.rotateBy(-objectRotator.degMagnitude, 0);
				break;
			case "ArrowUp":
				cubeSystem.makeU();
				break;
			case "ArrowDown":
				cubeSystem.makeD();
				break;
			case "ArrowRight":
				cubeSystem.makeR();
				break;
			case "ArrowLeft":
				cubeSystem.makeL();
				break;
			case "Space":
				cubeSystem.makeF();
				break;
			case "KeyX":
				cubeSystem.makeB();
				break;
			default:
				break;
		}
	} else {
		switch (ev.code) {
			case "ArrowUp":
				cubeSystem.makeUInverse();
				break;
			case "ArrowDown":
				cubeSystem.makeDInverse();
				break;
			case "ArrowRight":
				cubeSystem.makeRInverse();
				break;
			case "ArrowLeft":
				cubeSystem.makeLInverse();
				break;
			case "KeyZ":
				cubeSystem.makeFInverse();
				break;
			case "KeyX":
				cubeSystem.makeBInverse();
				break;
			default:
				break;
		}
	}
});
