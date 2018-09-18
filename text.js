class Notifications {
	constructor() {
		this.captions = [];
	}

	display() {
		for (var i = 0; i < this.captions.length; i++) {
			if (!this.captions[i].isFinished())	{
				this.captions[i].display(i);
			}
			else {
				this.captions.splice(i,1);
			}
		}
	}

	addText(string) {
		this.captions.push(new Caption(string));
	}
}

class Caption {
	constructor(message) {
		this.message = message;
		this.lifespan = 255;
		this.col;
		this.size = 24;
	}

	isFinished() {
		if (this.lifespan <= 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	display(position) {
		this.col = color(200,50,150,this.lifespan);
		textSize(this.size);
		fill(this.col);
		text(this.message, 10, 40 + position*30);
		this.lifespan--;
	}
}
