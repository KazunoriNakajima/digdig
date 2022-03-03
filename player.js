class Player {
    // static centerDig;
    // static movableDig;
    // static digStatus;
    // static centerDigElement;
    // static movableDigElement;

    // static groundFrame;
    // static keyStatus;

    // static actionStartFrame;
    // static moveSource;
    // static moveDestination;
    // static rotateBeforeLeft;
    // static rotateAfterLeft;
    // static rotateFromRotation;

    static initialize () {
        // キーボードの入力を確認する
        this.keyStatus = {
            right: false,
            left: false,
            up: false,
            down: false
        };
        // ブラウザのキーボードの入力を取得するイベントリスナを登録する
        document.addEventListener('keydown', (e) => {
            // キーボードが押された場合
            switch(e.keyCode) {
                case 37: // 左向きキー
                    this.keyStatus.left = true;
                    e.preventDefault(); return false;
                case 38: // 上向きキー
                    this.keyStatus.up = true;
                    e.preventDefault(); return false;
                case 39: // 右向きキー
                    this.keyStatus.right = true;
                    e.preventDefault(); return false;
                case 40: // 下向きキー
                    this.keyStatus.down = true;
                    e.preventDefault(); return false;
            }
        });
        document.addEventListener('keyup', (e) => {
            // キーボードが離された場合
            switch(e.keyCode) {
                case 37: // 左向きキー
                    this.keyStatus.left = false;
                    e.preventDefault(); return false;
                case 38: // 上向きキー
                    this.keyStatus.up = false;
                    e.preventDefault(); return false;
                case 39: // 右向きキー
                    this.keyStatus.right = false;
                    e.preventDefault(); return false;
                case 40: // 下向きキー
                    this.keyStatus.down = false;
                    e.preventDefault(); return false;
            }
        });
    }
    //でぃぐ設置確認
    static createNewDig () {
        // でぃぐでぃぐが置けるかどうか、1番上の段の左から3つ目を確認する
        if(Stage.board[0][2]) {
            // 空白でない場合は新しいでぃぐを置けない
            return false;
        }
        // 新しいでぃぐの色を決める
        // Erikoさんだけ出現確率を1/nにする
        let n = 3;
        const digColors = Math.max(1, Math.min(5, Config.digColors));
        this.centerDig = Math.floor((Math.random() * (digColors * n - (n-1)))/3 + 1);
        this.movableDig = Math.floor((Math.random() * (digColors * n - (n - 1)))/3 + 1);
        // 新しいでぃぐ画像を作成する
        this.centerDigElement = DigImage.getDig(this.centerDig);
        this.movableDigElement = DigImage.getDig(this.movableDig);
        Stage.stageElement.appendChild(this.centerDigElement);
        Stage.stageElement.appendChild(this.movableDigElement);
        // でぃぐの初期配置を定める
        this.digStatus = {
            x: 2, // 中心でぃぐの位置: 左か3列目
            y: -1, // 画面上部ギリギリから出てくる
            left: 2 * Config.digImgWidth,
            top: -1 * Config.digImgHeight,
            dx: 0, // 動くでぃぐの相対位置: 動くでぃぐは上方向にある
            dy: -1, 
            rotation: 90 // 動くでぃぐの角度は90度（上向き）
        };
        // 接地時間はゼロ
        this.groundFrame = 0;
        // でぃぐを描画
        this.setDigPosition();
        return true;
    }

    static setDigPosition () {
        this.centerDigElement.style.left = this.digStatus.left + 'px';
        this.centerDigElement.style.top = this.digStatus.top + 'px';
        const x = this.digStatus.left + Math.cos(this.digStatus.rotation * Math.PI / 180) * Config.digImgWidth;
        const y = this.digStatus.top - Math.sin(this.digStatus.rotation * Math.PI / 180) * Config.digImgHeight;
        this.movableDigElement.style.left = x + 'px';
        this.movableDigElement.style.top = y + 'px';
    }

    static falling (isDownPressed) {
        // 現状の場所の下にブロックがあるかどうか確認する
        let isBlocked = false;
        let x = this.digStatus.x;
        let y = this.digStatus.y;
        let dx = this.digStatus.dx;
        let dy = this.digStatus.dy;
        if(y + 1 >= Config.stageRows || Stage.board[y + 1][x] || (y + dy + 1 >= 0 && (y + dy + 1 >= Config.stageRows || Stage.board[y + dy + 1][x + dx]))) {
            isBlocked = true;
        }
        if(!isBlocked) {
            // 下にブロックがないなら自由落下してよい。プレイヤー操作中の自由落下処理をする
            // でぃぐがTsubasaさんのときだけ落下スピードを上げる
            if (this.centerDig === 2 || this.movableDig === 2){
                this.digStatus.top += Config.playerFallingSpeedForTsubasa;
            } else {
                this.digStatus.top += Config.playerFallingSpeed;
            }
            if(isDownPressed) {
                // 下キーが押されているならもっと加速する
                this.digStatus.top += Config.playerDownSpeed;
            }
            if(Math.floor(this.digStatus.top / Config.digImgHeight) != y) {
                // ブロックの境を超えたので、再チェックする
                // 下キーが押されていたら、得点を加算する
                if(isDownPressed) {
                    Score.addScore(1);
                }
                y += 1;
                this.digStatus.y = y;
                if(y + 1 >= Config.stageRows || Stage.board[y + 1][x] || (y + dy + 1 >= 0 && (y + dy + 1 >= Config.stageRows || Stage.board[y + dy + 1][x + dx]))) {
                    isBlocked = true;
                }
                if(!isBlocked) {
                    // 境を超えたが特に問題はなかった。次回も自由落下を続ける
                    this.groundFrame = 0;
                    return;
                } else {
                    // 境を超えたらブロックにぶつかった。位置を調節して、接地を開始する
                    this.digStatus.top = y * Config.digImgHeight;
                    this.groundFrame = 1;
                    return;
                }
            } else {
                // 自由落下で特に問題がなかった。次回も自由落下を続ける
                this.groundFrame = 0;
                return;
            }
        }
        if(this.groundFrame == 0) {
            // 初接地である。接地を開始する
            this.groundFrame = 1;
            return;
        } else {
            this.groundFrame++;
            if(this.groundFrame > Config.playerGroundFrame) {
                return true;
            }
        }

    }
    static playing(frame) {
        // まず自由落下を確認する
        // 下キーが押されていた場合、それ込みで自由落下させる
        if(this.falling(this.keyStatus.down)) {
            // 落下が終わっていたら、でぃぐを固定する
            this.setDigPosition();
            return 'fix';
        }
        this.setDigPosition();
        if(this.keyStatus.right || this.keyStatus.left) {
            // 左右のの確認をする
            let cx = (this.keyStatus.right) ? 1 : -1;
            // でぃぐがTamarohさんのときは動きの左右を逆転する
            if(this.centerDig === 1 || this.movableDig === 1){
                cx = cx * (-1);
            }
            const x = this.digStatus.x;
            const y = this.digStatus.y;
            const mx = x + this.digStatus.dx;
            const my = y + this.digStatus.dy;
            // その方向にブロックがないことを確認する
            // まずは自分の左右を確認
            let canMove = true;
            if(y < 0 || x + cx < 0 || x + cx >= Config.stageCols || Stage.board[y][x + cx]) {
                if(y >= 0) {
                    canMove = false;
                }
            }
            if(my < 0 || mx + cx < 0 || mx + cx >= Config.stageCols || Stage.board[my][mx + cx]) {
                if(my >= 0) {
                    canMove = false;
                }
            }
            // 接地していない場合は、さらに1個下のブロックの左右も確認する
            if(this.groundFrame === 0) {
                if(y + 1 < 0 || x + cx < 0 || x + cx >= Config.stageCols || Stage.board[y + 1][x + cx]) {
                    if(y + 1 >= 0) {
                        canMove = false;
                    }
                }
                if(my + 1 < 0 || mx + cx < 0 || mx + cx >= Config.stageCols || Stage.board[my + 1][mx + cx]) {
                    if(my + 1 >= 0) {
                        canMove = false;
                    }
                }
            }

            if(canMove) {         
                // 動かすことが出来るので、移動先情報をセットして移動状態にする       
                this.actionStartFrame = frame;
                this.moveSource = x * Config.digImgWidth;
                this.moveDestination = (x + cx) * Config.digImgWidth;
                this.digStatus.x += cx;
                return 'moving';
            }
        } else if(this.keyStatus.up) {
            //でぃぐがMioさんの場合、回転させない
            if(this.centerDig !== 4 && this.movableDig !== 4){
                // 回転を確認する
                // 回せるかどうかは後で確認。まわすぞ
                const x = this.digStatus.x;
                const y = this.digStatus.y;
                const mx = x + this.digStatus.dx;
                const my = y + this.digStatus.dy;
                const rotation = this.digStatus.rotation;
                let canRotate = true;

                let cx = 0;
                let cy = 0;
                if(rotation === 0) {
                    // 右から上には100% 確実に回せる。何もしない
                } else if(rotation === 90) {
                    // 上から左に回すときに、左にブロックがあれば右に移動する必要があるのでまず確認する
                    if(y + 1 < 0 || x - 1 < 0 || x - 1 >= Config.stageCols || Stage.board[y + 1][x - 1]) {
                        if(y + 1 >= 0) {
                            // ブロックがある。右に1個ずれる
                            cx = 1;
                        }
                    }
                    // 右にずれる必要がある時、右にもブロックがあれば回転出来ないので確認する
                    if(cx === 1) {
                        if(y + 1 < 0 || x + 1 < 0 || y + 1 >= Config.stageRows || x + 1 >= Config.stageCols || Stage.board[y + 1][x + 1]) {
                            if(y + 1 >= 0) {
                                // ブロックがある。回転出来なかった
                                canRotate = false;
                            }
                        }
                    }
                } else if(rotation === 180) {
                    // 左から下に回す時には、自分の下か左下にブロックがあれば1個上に引き上げる。まず下を確認する
                    if(y + 2 < 0 || y + 2 >= Config.stageRows || Stage.board[y + 2][x]) {
                        if(y + 2 >= 0) {
                            // ブロックがある。上に引き上げる
                            cy = -1;
                        }
                    }
                    // 左下も確認する
                    if(y + 2 < 0 || y + 2 >= Config.stageRows || x - 1 < 0 || Stage.board[y + 2][x - 1]) {
                        if(y + 2 >= 0) {
                            // ブロックがある。上に引き上げる
                            cy = -1;
                        }
                    }
                } else if(rotation === 270) {
                    // 下から右に回すときは、右にブロックがあれば左に移動する必要があるのでまず確認する
                    if(y + 1 < 0 || x + 1 < 0 || x + 1 >= Config.stageCols || Stage.board[y + 1][x + 1]) {
                        if(y + 1 >= 0) {
                            // ブロックがある。左に1個ずれる
                            cx = -1;
                        }
                    }
                    // 左にずれる必要がある時、左にもブロックがあれば回転出来ないので確認する
                    if(cx === -1) {
                        if(y + 1 < 0 || x - 1 < 0 || x - 1 >= Config.stageCols || Stage.board[y + 1][x - 1]) {
                            if(y + 1 >= 0) {
                                // ブロックがある。回転出来なかった
                                canRotate = false;
                            }
                        }
                    }
                }
                
                if(canRotate) {
                    // 上に移動する必要があるときは、一気にあげてしまう
                    if(cy === -1) {
                        if(this.groundFrame > 0) {
                            // 接地しているなら1段引き上げる
                            this.digStatus.y -= 1;
                            this.groundFrame = 0;
                        }
                        this.digStatus.top = this.digStatus.y * Config.digImgHeight;
                    }
                    // 回すことが出来るので、回転後の情報をセットして回転状態にする
                    this.actionStartFrame = frame;
                    this.rotateBeforeLeft = x * Config.digImgHeight;
                    this.rotateAfterLeft = (x + cx) * Config.digImgHeight;
                    this.rotateFromRotation = this.digStatus.rotation;
                    // 次の状態を先に設定しておく
                    this.digStatus.x += cx;
                    const distRotation = (this.digStatus.rotation + 90) % 360;
                    const dCombi = [[1, 0], [0, -1], [-1, 0], [0, 1]][distRotation / 90];
                    this.digStatus.dx = dCombi[0];
                    this.digStatus.dy = dCombi[1];
                    return 'rotating';
                }
            }
        }
        return 'playing';
    }
    static moving(frame) {
        // 移動中も自然落下はさせる
        this.falling();
        const ratio = Math.min(1, (frame - this.actionStartFrame) / Config.playerMoveFrame);
        this.digStatus.left = ratio * (this.moveDestination - this.moveSource) + this.moveSource;
        this.setDigPosition();
        if(ratio === 1) {
            return false;
        }
        return true;
    }
    static rotating(frame) {
        // 回転中も自然落下はさせる
        this.falling();
        const ratio = Math.min(1, (frame - this.actionStartFrame) / Config.playerRotateFrame);
        this.digStatus.left = (this.rotateAfterLeft - this.rotateBeforeLeft) * ratio + this.rotateBeforeLeft;
        this.digStatus.rotation = this.rotateFromRotation + ratio * 90;
        this.setDigPosition();
        if(ratio === 1) {
            this.digStatus.rotation = (this.rotateFromRotation + 90) % 360;
            return false;
        }
        return true;
    }

    static fix() {
        // 現在のでぃぐをステージ上に配置する
        const x = this.digStatus.x;
        const y = this.digStatus.y;
        const dx = this.digStatus.dx;
        const dy = this.digStatus.dy;
        if(y >= 0) {
            // 画面外のでぃぐは消してしまう
            Stage.setDig(x, y, this.centerDig);
            Stage.digCount++;
        }
        if(y + dy >= 0) {
            // 画面外のでぃぐは消してしまう
            Stage.setDig(x + dx, y + dy, this.movableDig);
            Stage.digCount++;
        }
        // 操作用に作成したでぃぐ画像を消す
        Stage.stageElement.removeChild(this.centerDigElement);
        Stage.stageElement.removeChild(this.movableDigElement);
        this.centerDigElement = null;
        this.movableDigElement = null;
    }

    static batankyu() {
      if (this.keyStatus.up) {
        location.reload()
      }
    }
}
