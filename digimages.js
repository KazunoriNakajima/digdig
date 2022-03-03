class DigImage {

    // static digImages;
    // static batankyuImage;
    // static gameOverFrame;

    static initialize() {
        this.digImages = [];
        for(let i = 0; i < 5; i++) {
            const image = document.getElementById(`dig_${i + 1}`);
            image.removeAttribute('id');
            image.width = Config.digImgWidth;
            image.height = Config.digImgHeight;
            image.style.position = 'absolute';
            this.digImages[i] = image;
        }

        this.batankyuImage = document.getElementById('batankyu');
        this.batankyuImage.width = Config.digImgWidth * 6;
        this.batankyuImage.style.position = 'absolute';
    }

    static getDig(index) {
        const image = this.digImages[index - 1].cloneNode(true);
        return image;
    }

    static prepareBatankyu(frame) {
        this.gameOverFrame = frame;
        Stage.stageElement.appendChild(this.batankyuImage);
        this.batankyuImage.style.top = -this.batankyuImage.height + 'px';
    }

    static batankyu(frame) {
        const ratio = (frame - this.gameOverFrame) / Config.gameOverFrame;
        const x = Math.cos(Math.PI / 2 + ratio * Math.PI * 2 * 10) * Config.digImgWidth;
        const y = Math.cos(Math.PI + ratio * Math.PI * 2) * Config.digImgHeight * Config.stageRows / 4 + Config.digImgHeight * Config.stageRows / 2;
        this.batankyuImage.style.left = x + 'px';
        this.batankyuImage.style.top = y + 'px';
    }
}
