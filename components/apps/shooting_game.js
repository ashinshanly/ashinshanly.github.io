import React, { Component } from 'react';
import styles from '../../styles/shooting_game.module.scss';

export class ShootingGame extends Component {
    constructor(props) {
        super(props);

        // Constants
        this.fps          = 1000 / 30;
        this.rotateSpd    = 4;
        this.fireInterval = 300;
        this.fireSpd      = 0.15;
        this.spdPerSummon = 250;
        this.minSummonSpd = 500;
        this.zombieSpd    = 0.025;
        this.zombieDelay  = 2000;
        this.lifeCount    = 3;
        this.center       = {x: 4, y: 4};
        this.screen       = {width: 8, height: 8};
        this.turret       = {width: 0.8, height: 0.8};
        this.fire         = {width: 0.25, height: 0.25};
        this.zombie       = {width: 0.65, height: 1.2};
        this.noSummonArea = {x1: 2, x2: 7, y1: 2, y2: 7};

        this.state = {
            time: performance.now(),
            holdLeft: false,
            holdRight: false,
            rotation: 0,
            lastFire: 0,
            summonSpd: 5000,
            summonTime: 0,
            turret: [],
            fires: [],
            zombies: [],
            life: this.lifeCount,
            score: 0,
            pause: true,
            showTitle: true,
            showTryAgain: false,
            debugText: ''
        };
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.setState({turret: [{
            x: this.center.x - (this.turret.width / 2),
            y: this.center.y - (this.turret.height / 2)
        }]});
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        cancelAnimationFrame(this.gameLoop);
    }

    handleKeyDown = (evt) => {
        if (this.state.pause) return false;

        if (evt.keyCode === 32) {
            if (this.state.lastFire === 0 || 
                (performance.now() - this.state.lastFire > this.fireInterval && 
                 this.state.fires.length < 2)) {
                this.setState({lastFire: performance.now()});
                this.throwFire();
            }
        } else if (evt.keyCode === 37) {
            this.setState({holdLeft: true});
        } else if (evt.keyCode === 39) {
            this.setState({holdRight: true});
        }
    }

    handleKeyUp = (evt) => {
        if (evt.keyCode === 32 || evt.keyCode === 13) {
            if (this.state.showTitle) {
                if (!this.state.showTryAgain) {
                    this.setState({
                        showTitle: false,
                        pause: false
                    }, this.animate);
                } else {
                    this.restartGame();
                }
            }
        } else if (evt.keyCode === 37) {
            this.setState({holdLeft: false});
        } else if (evt.keyCode === 39) {
            this.setState({holdRight: false});
        }
    }

	// ----- Helpers/Methods

	// Returns the value of number as 'rem'
	remVal(value) {
		return `${value}rem`;
	}

	// Generate random numbers
	randomNum(value) {
		return Math.floor(Math.random() * Math.floor(value));
	}

	// The time for Turry to fire a fire
	throwFire() {
		let tmpFire = this.state.fires;
		let angle   = (this.state.rotation - 90) * Math.PI / 180;
		let half    = {w: this.fire.width / 2, h: this.fire.height / 2};

		tmpFire.push({
			a: angle,
			x: this.center.x - half.w + Math.cos(angle),
			y: this.center.y - half.h + Math.sin(angle)
		});

		this.setState({fires: tmpFire});
	}

	// Timeout in summoning Zoomy the Zombie
	summonZombieTrigger() {
		if (this.state.summonTime > this.state.summonSpd) {
			this.summonZombie();

			let nextSummonSpd = (this.state.summonSpd > this.minSummonSpd) ?
					this.state.summonSpd - 100 : this.minSummonSpd;

			this.setState({summonTime: 0});
			this.setState({summonSpd: nextSummonSpd});
		}
		else {
			this.setState({summonTime: this.state.summonTime + this.fps});
		}
	}

	// The time for Zoomy the zombie will be summoned
	summonZombie() {
		let tmpZombie = this.state.zombies;
		let half = {
			width: this.zombie.width / 2,
			height: this.zombie.height / 2
		};
		let random = {
			x: (this.randomNum(this.screen.width * 100) / 100) - half.width,
			y: (this.randomNum(this.screen.height * 100) / 100) - half.height
		};
		let addClass = (random.x > this.center.x) ?　'flip' : '';
		let angle    = 0;

		if (
			random.x > this.noSummonArea.x1 &&
			random.x < this.noSummonArea.x2 &&
			random.y > this.noSummonArea.y1 &&
			random.y < this.noSummonArea.y2
		) {
			this.summonZombie();

			return false;
		}

		let a = this.center.y - random.y;
		let b = this.center.x - random.x;

		angle = Math.atan2(a, b);

		tmpZombie.push({
			a: angle,
			x: random.x,
			y: random.y,
			c: addClass,
			d: performance.now(),
			s: false
		});

		this.setState({zombies: tmpZombie});
	}
	
	// Reset the game
	restartGame() {
		this.setState({time: performance.now()});
		this.setState({holdLeft: false});
		this.setState({holdRight: false});
		this.setState({rotation: 0});
		this.setState({lastFire: 0});
		this.setState({summonSpd: 5000});
		this.setState({summonTime: 0});
		this.setState({fires: []});
		this.setState({zombies: []});
		this.setState({life: this.lifeCount});
		this.setState({score: 0});
		this.setState({pause: true});
		this.setState({showTitle: true});
		this.setState({showTryAgain: false});
	}

	// ----- Collisions

	// When an object/s collided into the edge of the screen
	edgeCollision(i, arr, width, height) {
		let tmpArr = arr;
		let tmpObj = tmpArr[i];

		if (
			tmpObj.x + width < 0 ||
			tmpObj.y + height < 0 ||
			tmpObj.x > this.screen.width ||
			tmpObj.y > this.screen.height
		) {
			tmpArr.splice(i, 1);
		}

		return tmpArr;
	}

	// When an object/s collided into another object
	objectCollision(i, arr1, width1, height1, arr2, width2, height2, callback) {
		let tmpArr1 = arr1;
		let tmpArr2 = arr2;
		let tmpObj1 = tmpArr1[i];

		for (let j = 0; j < tmpArr2.length; j++) {
			let tmpObj2 = tmpArr2[j];

			if (
				typeof tmpObj1 !== 'undefined' &&
				tmpObj1.x + width1 > tmpObj2.x &&
				tmpObj1.x < tmpObj2.x + width2 &&
				tmpObj1.y + width1 > tmpObj2.y &&
				tmpObj1.y < tmpObj2.y + width2
			) {
				callback(i, j, tmpArr1, tmpArr2);

				break;
			}
		}

		return {fire: tmpArr1, zombie: tmpArr2};
	}

	// Call the possible collisions of Turry's fire
	fireCollision(i) {
		let tmpArr = this.edgeCollision(
			i,
			this.state.fires,
			this.fire.width,
			this.fire.height
		);
		let objArr = this.objectCollision(
			i,
			this.state.fires,
			this.fire.width,
			this.fire.height,
			this.state.zombies,
			this.zombie.width,
			this.zombie.height,
			(i, j, tmpArr1, tmpArr2) => {
				tmpArr1.splice(i, 1);

				var zombies = this.state.zombies;

				if (zombies[j].s === false) {
					this.setState({score: this.state.score + 1});
				}

				zombies[j].c = zombies[j].c + ' zombie-dying';
				zombies[j].s = true;

				this.setState({zombies: zombies});
			}
		);

		tmpArr = objArr.fire;

		this.setState({zombie: objArr.zombie});

		return tmpArr;
	}

	// Call the possible collisions of Zoomy
	zombieCollision(i) {
		let tmpZombie = this.edgeCollision(
			i,
			this.state.zombies,
			this.zombie.width,
			this.zombie.height
		);
		let objArr = this.objectCollision(
			i,
			this.state.zombies,
			this.zombie.width,
			this.zombie.height,
			this.state.turret,
			this.turret.width,
			this.turret.height,
			(i, j, tmpArr1, tmpArr2) => {
				let zombies = this.state.zombies;
				
				if (zombies[i].c.indexOf('zombie-hiding') < 0) {
					zombies[i].c = zombies[i].c.replace(/zombie\-walking/g, 'zombie-hiding');
					zombies[i].s = true;

					this.setState({zombies: zombies});
					this.setState({life: this.state.life - 1});
				}

				if (this.state.life === 0) {
					this.setState({pause: true});
					
					let tryAgainTimeout = setTimeout(() => {
						clearTimeout(tryAgainTimeout);
						
						// cancelAnimationFrame(this.gameLoop);
						
						this.setState({showTryAgain: true});
						this.setState({showTitle: true});
					}, 500);
				}
			}
		);

		return tmpZombie;
	}

	// ----- Animation

	// Animate when Turry changes its angle
	// Press LEFT key to turn anti-clockwise
	// Press RIGHT key to turn clockwise
	animateRotation() {
		if (this.state.holdLeft === true) {
			if (this.state.rotation > 0) {
				this.setState({rotation: this.state.rotation - this.rotateSpd});
			} else {
				this.setState({rotation: 360});
			}
		} else if (this.state.holdRight === true) {
			if (this.state.rotation < 360) {
				this.setState({rotation: this.state.rotation + this.rotateSpd});
			} else {
				this.setState({rotation: 0});
			}
		}
	}

	// Animate the movement of a/an o/object with array
	animateMoveByArray(arr, spd, collision, delay = 0, callback = null) {
		let tmpArr = arr;

		for (let i = 0; i < tmpArr.length; i++) {
			if (
				(delay > 0 &&
				performance.now() - tmpArr[i].d < delay) ||
				tmpArr[i].s === true
			) {
				continue;
			}

			tmpArr[i].x += spd * Math.cos(tmpArr[i].a);
			tmpArr[i].y += spd * Math.sin(tmpArr[i].a);

			tmpArr = collision(i);

			if (callback !== null) {
				callback(i);
			}
		}

		return tmpArr;
	}

	// Animate the movement of the fire when Turry fires it
	animateFire() {
		this.setState({
			fires: this.animateMoveByArray(
				this.state.fires,
				this.fireSpd,
				this.fireCollision.bind(this),
				0
			)
		});
	}

	// Animate the movement of Zoomy, because he wants to eat Turry's brain
	animateZombie() {
		this.setState({
			zombies: this.animateMoveByArray(
				this.state.zombies,
				this.zombieSpd,
				this.zombieCollision.bind(this),
				this.zombieDelay,
				(i) => {
					let zombies = this.state.zombies;

					if (
						zombies[i].c.indexOf('zombie-walking') < 0 &&
						zombies[i].c.indexOf('zombie-hiding') < 0
					) {
						zombies[i].c = zombies[i].c + ' zombie-walking';
					}

					this.setState({zombies: zombies});
				}
			)
		});
	}

	// The animation, or the game loop, or whatever it is called
	animate() {
		let gameLoop = requestAnimationFrame(this.animate.bind(this));
		
		if (this.state.pause === true) {
			cancelAnimationFrame(gameLoop);
		}

		// Perform animation for 30 frames per second
		// FPS is set at constructor()
		if (
			performance.now() - this.state.time > this.fps &&
			this.state.pause === false
		) {
			this.setState({time: performance.now()});

			this.animateRotation();
			this.animateFire();
			this.animateZombie();

			this.summonZombieTrigger();
		}
	}

	// ----- Rendering

	// Rendering of objects using array
	renderByArray(className, object, innerJSX = null, callback = null) {
		let objs     = object;
		let objArray = [];

		for (let i = 0; i < objs.length; i++) {
			let obj      = objs[i];
			let style    = {top: this.remVal(obj.y), left: this.remVal(obj.x)};
			let addClass = (typeof obj.c !== 'undefined') ?
				(`${className} ${obj.c}`) : className;

			if (callback === null) {
				objArray.push(
					<div className={addClass} style={style}>{innerJSX}</div>
				);
			} else {
				objArray.push(
					<div
						className={addClass}
						style={style}
						onAnimationEnd={callback.bind(this, i)}
					>{innerJSX}</div>
				);
			}
		}

		return objArray;
	}

	// Tender the fire when Turry shoots a fire
	renderFire() {
		return this.renderByArray('fire', this.state.fires);
	}

	// Render Turry the turret: The main character
	renderTurret() {
		let style = {transform: 'rotate(' + this.state.rotation + 'deg)'};

		return (
			<div className="turret" style={style}>
				<div className="gun"></div>
				<div className="body"></div>
			</div>
		);
	}

	// Render Zoomy the zombie: He's trying to eat Turry's brain (wut?)
	renderZombie() {
		return this.renderByArray(
			'zombie',
			this.state.zombies,
			<div className="zombie-wrapper">
				<div className="hole"></div>
				<div className="head">
					<div className="eyes"></div>
				</div>
				<div className="body"></div>
				<div className="arm right"></div>
				<div className="arm left"></div>
				<div className="leg right"></div>
				<div className="leg left"></div>
			</div>,
			(i, event) => {
				if (['zombie-fade-out', 'zombie-hiding'].indexOf(event.animationName) >= 0) {
					let zombies = this.state.zombies;

					zombies.splice(i, 1);

					this.setState({zombies: zombies});
				}
			}
		);
	}

	// Render Turry's life points
	renderLife() {
		let lifeArray = [];

		for (let i = 1; i <= this.lifeCount; i++) {
			let lifeClassName = (i <= this.state.life) ?
					'heart full' : 'heart empty';

			lifeArray.push(<div className={lifeClassName}></div>)
		}

		return (
			<div className="life">{lifeArray}</div>
		);
	}

	// Render the current score
	renderScore() {
		let score    = this.state.score.toString();
		let scoreArr = score.split('');
		let scoreElm = [];

		for (let i = 0; i < scoreArr.length; i++) {
			let scoreClassName = `char-${scoreArr[i]}`;

			scoreElm.push(<div className={scoreClassName}></div>);
		}

		return <div className="score">{scoreElm}</div>;
	}

	// Render the word
	renderWord(words, size = '') {
		let textSize  = (size !== '') ? (size + '-') : size;
		let tmpJSX    = [];
		let returnJSX = [];

		for (let i in words) {
			tmpJSX = [];
			
			for (let j in words[i]) {
				let textClassName = 'char-' + textSize + words[i][j];

				tmpJSX.push(<div className={textClassName}></div>);
			}
			
			returnJSX.push(
				<div className="title-content">{tmpJSX}</div>
			);
		}

		return returnJSX;
	}

	// Render the game title
	renderTitle() {
		let titleClass   = (this.state.showTitle === true) ? 'title' : 'title hide';
		let titleText    = (this.state.showTryAgain === false) ?
				['turret', 'shooting game'] : ['you lose'];
		let subTitleText = (this.state.showTryAgain === false) ?
				['shoot the never', 'ending zombies'] :
				['these zombies has', 'eaten your brain'];
		let startText    = (this.state.showTryAgain === false) ?
				[
					'press space to start',
					'',
					'directions',
					'press left to turn anti clockwise',
					'press right to turn clockwise',
					'press space to fire'
				] : ['press space to restart'];
		let titleJSX     = this.renderWord(titleText, 'large');
		let subTitleJSX  = this.renderWord(subTitleText, '');
		let startJSX     = this.renderWord(startText, 'small');

		return (
			<div className={titleClass}>
				<div className="game-title">
					{titleJSX}
				</div>
				<div className="game-title">
					{subTitleJSX}
				</div>
				<div className="game-title">
					{startJSX}
				</div>
			</div>
		);
	}

    render() {
        return (
            <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none">
                <div className="flex items-center justify-between p-2 bg-ub-warm-grey">
                    <span>Shooting Game</span>
                    <span>Score: {this.state.score} | Lives: {this.state.life}</span>
                </div>
                <div className={styles.gameContainer}>
                    <div className={styles.screen}>
                        <div className={styles.debug}>{this.state.debugText}</div>
                        {this.renderZombie()}
                        {this.renderFire()}
                        {this.renderTurret()}
                        {this.renderLife()}
                        {this.renderScore()}
                        {this.renderTitle()}
                    </div>
                </div>
            </div>
        );
    }
}

export const displayShootingGame = () => {
    return <ShootingGame />;
}

export default ShootingGame;
