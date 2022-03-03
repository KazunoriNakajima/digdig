class Stage {
    // static stageElement;
    // static scoreElement;
    // static zenkeshiImage;
    // static board;
    // static digCount;
    // static fallingDigList = [];
    // static eraseStartFrame;
    // static DInfoList = [];

    static initialize() {
        // HTML からステージの元となる要素を取得し、大きさを設定する
        const stageElement = document.getElementById("stage");
        stageElement.style.width = Config.digImgWidth * Config.stageCols + 'px';
        stageElement.style.height = Config.digImgHeight * Config.stageRows + 'px';
        stageElement.style.backgroundColor = Config.stageBackgroundColor;
        this.stageElement = stageElement;
        
        const zenkeshiImage = document.getElementById("zenkeshi");
        zenkeshiImage.width = Config.digImgWidth * 6;
        zenkeshiImage.style.position = 'absolute';
        zenkeshiImage.style.display = 'none';        
        this.zenkeshiImage = zenkeshiImage;
        stageElement.appendChild(zenkeshiImage);

        const scoreElement = document.getElementById("score");
        scoreElement.style.backgroundColor = Config.scoreBackgroundColor;
        scoreElement.style.top = Config.digImgHeight * Config.stageRows + 'px';
        scoreElement.style.width = Config.digImgWidth * Config.stageCols + 'px';
        scoreElement.style.height = Config.fontHeight + "px";
        this.scoreElement = scoreElement;

        // メモリを準備する
        this.board = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        let digCount = 0;
        for(let y = 0; y < Config.stageRows; y++) {
            const line = this.board[y] || (this.board[y] = []);
            for(let x = 0; x < Config.stageCols; x++) {
                const dig = line[x];
                if(dig >= 1 && dig <= 5) {
                    // line[x] = {dig: dig, element: this.setDig(x, y, dig)};
                    this.setDig(x, y, dig);
                    digCount++;
                } else {
                    line[x] = null;
                }
            }
        }
        this.digCount = digCount;
    }

    // 画面とメモリ両方に dig をセットする
    static setDig(x, y, dig) {
        // 画像を作成し配置する
        const digImage = DigImage.getDig(dig);
        digImage.style.left = x * Config.digImgWidth + "px";
        digImage.style.top = y * Config.digImgHeight + "px";
        this.stageElement.appendChild(digImage);
        // メモリにセットする
        this.board[y][x] = {
            dig: dig,
            element: digImage
        }
    }

    // 自由落下をチェックする
    static checkFall() {
        this.fallingDigList.length = 0;
        let isFalling = false;
        // 下の行から上の行を見ていく
        for(let y = Config.stageRows - 2; y >= 0; y--) { 
            const line = this.board[y];
            for(let x = 0; x < line.length; x++) {
                if(!this.board[y][x]) {
                    // このマスにでぃぐがなければ次
                    continue;
                }
                if(!this.board[y + 1][x]) {
                    // このでぃぐは落ちるので、取り除く
                    let cell = this.board[y][x];
                    this.board[y][x] = null;
                    let dst = y;
                    while(dst + 1 < Config.stageRows && this.board[dst + 1][x] == null) {
                        dst++;
                    }
                    // 最終目的地に置く
                    this.board[dst][x] = cell;
                    // 落ちるリストに入れる
                    this.fallingDigList.push({
                        element: cell.element,
                        position: y * Config.digImgHeight,
                        destination: dst * Config.digImgHeight,
                        falling: true
                    });
                    // 落ちるものがあったことを記録しておく
                    isFalling = true;
                }
            }
        }
        return isFalling;
    }
    // 自由落下させる
    static fall() {
        let isFalling = false;
        for(const fallingDig of this.fallingDigList) {
            if(!fallingDig.falling) {
                // すでに自由落下が終わっている
                continue;
            }
            let position = fallingDig.position;
            position += Config.freeFallingSpeed;
            if(position >= fallingDig.destination) {
                // 自由落下終了
                position = fallingDig.destination;
                fallingDig.falling = false;
            } else {
                // まだ落下しているでぃぐがあることを記録する
                isFalling = true;
            }
            // 新しい位置を保存する
            fallingDig.position = position;
            // でぃぐを動かす
            fallingDig.element.style.top = position + 'px';
        }
        return isFalling;
    }

    // 消せるかどうか判定する
    static checkErase(startFrame) {
        this.eraseStartFrame = startFrame;
        this.erasingDigInfoList.length = 0;

        // 何色のでぃぐを消したかを記録する
        const eraseDigColor = {};

        // 隣接でぃぐを確認する関数内関数を作成
        const sequenceDigInfoList = [];
        const existingDigInfoList = [];
        const checkSequentialDig = (x, y) => {
            // でぃぐがあるか確認する
            const orig = this.board[y][x];
            if(!orig) {
                // ないなら何もしない
                return;
            }
            // あるなら一旦退避して、メモリ上から消す
            const dig = this.board[y][x].dig;
            sequenceDigInfoList.push({
                x: x,
                y: y,
                cell: this.board[y][x]
            });
            this.board[y][x] = null;

            // 四方向の周囲でぃぐを確認する
            const direction = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for(let i = 0; i < direction.length; i++) {
                const dx = x + direction[i][0];
                const dy = y + direction[i][1];
                if(dx < 0 || dy < 0 || dx >= Config.stageCols || dy >= Config.stageRows) {
                    // ステージの外にはみ出た
                    continue;
                }
                const cell = this.board[dy][dx];
                if(!cell || cell.dig !== dig) {
                    // でぃぐの色が違う
                    continue;
                }
                // そのでぃぐのまわりのでぃぐも消せるか確認する
                checkSequentialDig(dx, dy);
                
            };
        };
        
        // 実際に削除できるかの確認を行う
        for(let y = 0; y < Config.stageRows; y++) {
            for(let x = 0; x < Config.stageCols; x++) {
                sequenceDigInfoList.length = 0;
                const digColor = this.board[y][x] && this.board[y][x].dig;
                checkSequentialDig(x, y);
                // Uraraさんの時だけ5ケ揃わないと消えないようにする
                if (digColor === 3){
                    if(sequenceDigInfoList.length == 0 || sequenceDigInfoList.length < Config.eraseDigCountForUrara) {
                        // 連続して並んでいる数が足りなかったので消さない
                        if(sequenceDigInfoList.length) {
                            // 退避していたでぃぐを消さないリストに追加する
                            existingDigInfoList.push(...sequenceDigInfoList);
                        } 
                    } else {
                        // これらは消して良いので消すリストに追加する
                        this.erasingDigInfoList.push(...sequenceDigInfoList);
                        eraseDigColor[digColor] = true;
                    }
                } else {
                    if(sequenceDigInfoList.length == 0 || sequenceDigInfoList.length < Config.eraseDigCount) {
                        // 連続して並んでいる数が足りなかったので消さない
                        if(sequenceDigInfoList.length) {
                            // 退避していたでぃぐを消さないリストに追加する
                            existingDigInfoList.push(...sequenceDigInfoList);
                        } 
                    } else {
                        // これらは消して良いので消すリストに追加する
                        this.erasingDigInfoList.push(...sequenceDigInfoList);
                        eraseDigColor[digColor] = true;
                    }
                }
            }
        }
        this.digCount -= this.erasingDigInfoList.length;

        // 消さないリストに入っていたでぃぐをメモリに復帰させる
        for(const info of existingDigInfoList) {
            this.board[info.y][info.x] = info.cell;
        }

        if(this.erasingDigInfoList.length) {
            // もし消せるならば、消えるでぃぐの個数と色の情報をまとめて返す
            return {
                piece: this.erasingDigInfoList.length,
                color: Object.keys(eraseDigColor).length
            };
        }
        return null;
    }
    // 消すアニメーションをする
    static erasing(frame) {
        const elapsedFrame = frame - this.eraseStartFrame;
        const ratio = elapsedFrame / Config.eraseAnimationDuration;
        if(ratio > 1) {
            // アニメーションを終了する
            for(const info of this.erasingDigInfoList) {
                var element = info.cell.element;
                this.stageElement.removeChild(element);
            }
            return false;
        } else if(ratio > 0.75) {
            for(const info of this.erasingDigInfoList) {
                var element = info.cell.element;
                element.style.display = 'block';
            }
            return true;
        } else if(ratio > 0.50) {
            for(const info of this.erasingDigInfoList) {
                var element = info.cell.element;
                element.style.display = 'none';
            }
            return true;
        } else if(ratio > 0.25) {
            for(const info of this.erasingDigInfoList) {
                var element = info.cell.element;
                element.style.display = 'block';
            }
            return true;
        } else {
            for(const info of this.erasingDigInfoList) {
                var element = info.cell.element;
                element.style.display = 'none';
            }
            return true;
        }
    }

    static showZenkeshi() {
        // 全消しを表示する
        this.zenkeshiImage.style.display = 'block';
        this.zenkeshiImage.style.opacity = '1';
        const startTime = Date.now();
        const startTop = Config.digImgHeight * Config.stageRows;
        const endTop = Config.digImgHeight * Config.stageRows / 3;
        const animation = () => {
            const ratio = Math.min((Date.now() - startTime) / Config.zenkeshiDuration, 1);
            this.zenkeshiImage.style.top = (endTop - startTop) * ratio + startTop + 'px';
            if(ratio !== 1) {
                requestAnimationFrame(animation);
            }
        };
        animation();
    }
    static hideZenkeshi() {
        // 全消しを消去する
        const startTime = Date.now();
        const animation = () => {
            const ratio = Math.min((Date.now() - startTime) / Config.zenkeshiDuration, 1);
            this.zenkeshiImage.style.opacity = String(1 - ratio);
            if(ratio !== 1) {
                requestAnimationFrame(animation);
            } else {
                this.zenkeshiImage.style.display = 'none';
            }
        };
        animation();
    }
}
Stage.fallingDigList = [];
Stage.erasingDigInfoList = [];
