function Ball(x,y,number)
{
	this.r = 25;
	this.col = color(random(0,255),random(0,255),random(0,255));
	this.pos = createVector(x,y);
	this.vel = createVector(0,0);
	this.isReleased = false;
	this.gotUnstuck = false;
	this.releaseCounter = 5;
	this.number = number;
	if (options.randomSpeed.value) // --Random Velocity--
	{
		this.isReleased = true;
		this.vel.set(random(-2,2),random(-2,2));
	}

	this.display = function()
	{
		noStroke();
		fill(this.col);
		ellipse(this.pos.x,this.pos.y,this.r*2,this.r*2);
		// fill(255-red(this.col),255-green(this.col),255-blue(this.col));
		// text(number, this.pos.x-this.r/4, this.pos.y+this.r/4);
	}

	this.move = function()
	{
		if (this.isReleased)
		{
			if (options.gravity.value)
			{
				this.vel.y = this.vel.y + gravityValue;
			}
			this.pos.add(this.vel);
			if (options.wall.value && this.vel.mag()>=10) //if speed exceed 10 and the ball bounce on the walls, slows down the speeding balls
			{
				this.vel.mult(0.9975);
			}
		}
		else
		{
			var mouse = createVector(mouseX,mouseY);
			var pMouse = createVector(pmouseX, pmouseY);
			var vel = p5.Vector.sub(mouse, pMouse);
			this.pos = mouse;
			this.vel = vel.mult(1);
			if (this.releaseCounter > 0)
			{
				this.releaseCounter--;
			}
			else
			{
				if (!this.vel.equals(0,0) && !options.oneBall.value || options.unstuck.value && !options.oneBall.value)
				{
					this.isReleased = true;
				}
			}
		}
	}

	this.release = function()
	{
		this.isReleased = true;
	}

	this.bounce = function()
	{
		if (this.pos.x >= width - this.r)
		{
			this.pos.x = width - this.r
			this.vel.x = -this.vel.x
		}
			if (this.pos.x <= 0 + this.r )
		{
			this.pos.x = 0 + this.r
			this.vel.x = -this.vel.x
		}

		if (this.pos.y >= height - this.r)
		{
			this.pos.y = height - this.r
			this.vel.y = -this.vel.y
		}
		if (this.pos.y <= 0 + this.r )
		{
			this.pos.y = 0 + this.r
			this.vel.y = -this.vel.y
		}
	}

	this.isOutOfBound = function()
	{
		if (!options.wall.value)
		{
			return (this.pos.x >= width + this.r || this.pos.x <= -this.r || this.pos.y >= height+this.r);
		}
		else
		{
			return (this.pos.x >= width + this.r || this.pos.x <= -this.r || this.pos.y >= height+this.r || this.pos.y <= -this.r);
		}
	}

	this.doesIntersect = function(other)
	{
		var d = this.pos.dist(other.pos);
		if (d < this.r + other.r)
		{
			console.log("ball " + this.number + " intersects ball " + other.number);
			return true;
		}
		else
		{
			return false;
		}
	}

	this.bumpsInto = function(other)
	{
		var direction = p5.vector;
		if (options.unstuck.value)
		{
			if (this.pos.equals(other.pos)) // if the 2 balls are in the exact same spot, move this one in a random position next to the other
			{
				direction = p5.Vector.random2D();
				direction.setMag(this.r+other.r);
				if (!this.gotUnstuck)
				{
					this.pos.add(direction);
					this.gotUnstuck = true;
				}
				else if (!other.gotUnstuck)
				{
					other.pos.add(direction);
					other.gotUnstuck = true;
				}
				else
				{
					console.log("we’re stuck, both balls already got unstuck")
				}
			}
			else
			{
				direction = p5.Vector.sub(this.pos,other.pos); // if they are just intersecting, move this one back a bit along the line joining their centers
				direction.setMag(this.r+other.r-direction.mag());
				if (!this.gotUnstuck)
				{
					this.pos.add(direction);
					this.gotUnstuck = true;
				}
				else if (!other.gotUnstuck)
				{
					other.pos.add(p5.Vector.mult(direction,-1));
					other.gotUnstuck = true;
				}
				else
				{
					console.log("we’re stuck, both balls already got unstuck")
				}
			}
		}
		if (!this.isReleased) // If this ball is still held by the mouse
		{
			console.log("this is held");
			direction = p5.Vector.sub(this.pos,other.pos);
			var velProjection = direction.mult((p5.Vector.dot(other.vel,direction)/direction.magSq()));
			other.vel.sub(velProjection.mult(2));
			if (!this.vel.equals(0,0))
			{
				velProjection = p5.Vector.mult(direction, p5.Vector.dot(this.vel,direction)/direction.magSq());
				other.vel.add(velProjection);
			}
		}
		else if (!other.isReleased) // if other ball is still held by the mouse
		{
			console.log("other is held");
			direction = p5.Vector.sub(other.pos,this.pos);
			var velProjection = p5.Vector.mult(direction, p5.Vector.dot(this.vel,direction)/direction.magSq());
			this.vel.sub(velProjection.mult(2));
			if (!other.vel.equals(0,0))
			{
				velProjection = p5.Vector.mult(direction, p5.Vector.dot(other.vel,direction)/direction.magSq());
				this.vel.add(velProjection);
			}
		}
		else // Otherwise, if both balls are free and bounce into each other
		{
			direction = p5.Vector.sub(other.pos,this.pos);
			var thisProjection = p5.Vector.mult(direction, p5.Vector.dot(this.vel,direction)/direction.magSq());
			var otherProjection = p5.Vector.mult(direction, p5.Vector.dot(other.vel,direction)/direction.magSq());
			this.vel.sub(thisProjection);
			this.vel.add(otherProjection);
			other.vel.sub(otherProjection);
			other.vel.add(thisProjection);
			this.vel.mult(0.975);
			other.vel.mult(0.975);
		}
	}

	this.attraction = function()
	{
		var mouse = createVector(mouseX,mouseY);
		var direction = p5.Vector.sub(this.pos,mouse);
		screenVector = createVector(width,height);
		direction.setMag(-0.001*(screenVector.mag()-direction.mag()));
		this.vel.add(direction);
	}

	this.blown = function()
	{
		var mouse = createVector(mouseX,mouseY);
		var direction = p5.Vector.sub(this.pos,mouse);
		screenVector = createVector(width,height);
		direction.setMag(0.0002*(screenVector.mag()-direction.mag()));
		this.vel.add(direction);
	}
}
