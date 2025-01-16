//Dev In-Progress

import React, { Component } from 'react';
import styles from '../../styles/shooting_game.module.scss';

export class ShootingGame extends Component {
    constructor(props) {
        super(props);

        // Constants
        this.fps          = 1000 / 30;
        this.rotateSpd    = 10;
        this.fireInterval = 100;
        this.fireSpd      = 0.15;
        this.spdPerSummon = 250;
        this.minSummonSpd = 500;
        this.zombieSpd    = 0.1;
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

    remVal(value) {
        return `${value}rem`;
    }

    randomNum(value) {
        return Math.floor(Math.random() * Math.floor(value));
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

    summonZombieTrigger() {
        if (this.state.summonTime > this.state.summonSpd) {
            this.summonZombie();

            let nextSummonSpd = (this.state.summonSpd > this.minSummonSpd) ?
                    this.state.summonSpd - 100 : this.minSummonSpd;

            this.setState({
                summonTime: 0,
                summonSpd: nextSummonSpd
            });
        } else {
            this.setState({summonTime: this.state.summonTime + this.fps});
        }
    }

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
        let addClass = (random.x > this.center.x) ? 'flip' : '';
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

    restartGame() {
        this.setState({
            time: performance.now(),
            holdLeft: false,
            holdRight: false,
            rotation: 0,
            lastFire: 0,
            summonSpd: 5000,
            summonTime: 0,
            fires: [],
            zombies: [],
            life: this.lifeCount,
            score: 0,
            pause: false,
            showTitle: false,
            showTryAgain: false
        });
    }

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
                let zombies = this.state.zombies;
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
                    this.setState({
                        zombies: zombies,
                        life: this.state.life - 1
                    });
                }

                if (this.state.life === 0) {
                    this.setState({pause: true});
                    setTimeout(() => {
                        this.setState({
                            showTryAgain: true,
                            showTitle: true
                        });
                    }, 500);
                }
            }
        );

        return tmpZombie;
    }
    
    moveZombies = () => {
      const updatedZombies = this.state.zombies.map(zombie => {
        // Calculate direction towards gun/turret center
        const dx = this.center.x - zombie.x;
        const dy = this.center.y - zombie.y;
        const angle = Math.atan2(dy, dx);
        
        // Move zombie towards gun
        return {
          ...zombie,
          x: zombie.x + Math.cos(angle) * this.zombieSpd,
          y: zombie.y + Math.sin(angle) * this.zombieSpd
        };
      });
    
      this.setState({ zombies: updatedZombies });
      this.checkCollisions();
    };
    
    checkCollisions = () => {
      // Check zombie-turret collisions
      this.state.zombies.forEach(zombie => {
        const turretHit = this.state.turret.some(t => {
          return (
            zombie.x < t.x + this.turret.width &&
            zombie.x + this.zombie.width > t.x &&
            zombie.y < t.y + this.turret.height &&
            zombie.y + this.zombie.height > t.y
          );
        });
    
        if (turretHit) {
          this.setState(prev => ({ 
            life: prev.life - 1,
            zombies: prev.zombies.filter(z => z !== zombie)
          }));
        }
      });
    
      // Check bullet-zombie collisions 
      this.state.fires.forEach(fire => {
        this.state.zombies.forEach(zombie => {
          const zombieHit = (
            fire.x < zombie.x + this.zombie.width &&
            fire.x + this.fire.width > zombie.x &&
            fire.y < zombie.y + this.zombie.height &&
            fire.y + this.fire.height > zombie.y
          );
    
          if (zombieHit) {
            this.setState(prev => ({
              score: prev.score + 1,
              zombies: prev.zombies.filter(z => z !== zombie),
              fires: prev.fires.filter(f => f !== fire)
            }));
          }
        });
      });
    };

    animate = () => {
        let gameLoop = requestAnimationFrame(this.animate);
        
        if (this.state.pause) {
            cancelAnimationFrame(gameLoop);
            return;
        }

        if (performance.now() - this.state.time > this.fps) {
            this.setState({time: performance.now()});

            this.animateRotation();
            this.animateFire();
            this.moveZombies();
            this.animateZombie();
            this.summonZombieTrigger();
        }
    }

    animateRotation() {
        if (this.state.holdLeft) {
            this.setState(prev => ({
                rotation: prev.rotation > 0 ? prev.rotation - this.rotateSpd : 360
            }));
        } else if (this.state.holdRight) {
            this.setState(prev => ({
                rotation: prev.rotation < 360 ? prev.rotation + this.rotateSpd : 0
            }));
        }
    }

    animateMoveByArray(arr, spd, collision, delay = 0, callback = null) {
        let tmpArr = arr;

        for (let i = 0; i < tmpArr.length; i++) {
            if ((delay > 0 && performance.now() - tmpArr[i].d < delay) || tmpArr[i].s === true) {
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

    animateFire() {
        this.setState({
            fires: this.animateMoveByArray(
                this.state.fires,
                this.fireSpd,
                this.fireCollision.bind(this)
            )
        });
    }

    animateZombie() {
        this.setState({
            zombies: this.animateMoveByArray(
                this.state.zombies,
                this.zombieSpd,
                this.zombieCollision.bind(this),
                this.zombieDelay,
                (i) => {
                    let zombies = this.state.zombies;
                    if (zombies[i].c.indexOf('zombie-walking') < 0 && 
                        zombies[i].c.indexOf('zombie-hiding') < 0) {
                        zombies[i].c = zombies[i].c + ' zombie-walking';
                    }
                    this.setState({zombies: zombies});
                }
            )
        });
    }

    renderByArray(className, object, innerJSX = null, callback = null) {
        return object.map((obj, i) => {
            const style = {
                top: this.remVal(obj.y),
                left: this.remVal(obj.x)
            };
            const addClass = obj.c ? `${className} ${obj.c}` : className;

            return callback ? (
                <div key={i} className={addClass} style={style} onAnimationEnd={(e) => callback(i, e)}>
                    {innerJSX}
                </div>
            ) : (
                <div key={i} className={addClass} style={style}>{innerJSX}</div>
            );
        });
    }

    renderTurret() {
        return (
            <div className={styles.turret} style={{transform: `rotate(${this.state.rotation}deg)`}}>
                <div className={styles.gun}></div>
                <div className={styles.body}></div>
            </div>
        );
    }

    renderFire() {
        return this.renderByArray(styles.fire, this.state.fires);
    }

    renderZombie() {
        return this.renderByArray(
            styles.zombie,
            this.state.zombies,
            <div className={styles.zombieWrapper}>
                <div className={styles.hole}></div>
                <div className={styles.head}>
                    <div className={styles.eyes}></div>
                </div>
                <div className={styles.body}></div>
                <div className={`${styles.arm} ${styles.right}`}></div>
                <div className={`${styles.arm} ${styles.left}`}></div>
                <div className={`${styles.leg} ${styles.right}`}></div>
                <div className={`${styles.leg} ${styles.left}`}></div>
            </div>,
            (i, event) => {
                if (['zombie-fade-out', 'zombie-hiding'].includes(event.animationName)) {
                    this.setState(prev => ({
                        zombies: prev.zombies.filter((_, index) => index !== i)
                    }));
                }
            }
        );
    }

    renderLife() {
        return (
            <div className={styles.life}>
                {[...Array(this.lifeCount)].map((_, i) => (
                    <div key={i} className={`${styles.heart} ${i < this.state.life ? styles.full : styles.empty}`} />
                ))}
            </div>
        );
    }

    renderScore() {
        return (
            <div className={styles.score}>
                {this.state.score.toString().split('').map((digit, i) => (
                    <div key={i} className={styles[`char-${digit}`]} />
                ))}
            </div>
        );
    }

    renderTitle() {
        const titleClass = this.state.showTitle ? styles.title : `${styles.title} ${styles.hide}`;
        const titleText = this.state.showTryAgain ? ['you lose'] : ['turret', 'shooting game'];
        const subTitleText = this.state.showTryAgain ? 
            ['these zombies has', 'eaten your brain'] : 
            ['shoot the never', 'ending zombies'];
        const startText = this.state.showTryAgain ? 
            ['press space to restart'] : 
            ['press space to start', '', 'directions', 'press left to turn anti clockwise',
             'press right to turn clockwise', 'press space to fire'];

        return (
            <div className={titleClass}>
                {[titleText, subTitleText, startText].map((textArray, i) => (
                    <div key={i} className={styles.gameTitle}>
                        {textArray.map((text, j) => (
                            <div key={j} className={styles.titleContent}>
                                {text.split('').map((char, k) => (
                                    <div key={k} className={styles[`char-${char}`]} />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
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

