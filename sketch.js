/* TO DO
	* Improve physics
		* improve the way 3 balls or more interract, we get these weird balls teleporting,
		  when a ball push one ball, this second ball should be able to push the third one with being
		  squeezed between the two. when pushing a ball out of another, we should check there is not a third one there…
		  --> try using a boolean alreadyMoved
		*implement pushing balls without velocity (they just move and stop instantly)
		*implement fixed balls
	* remake super attraction (like in the video)
	*improve alignment on the page (aligned right, should be left)
	*implement ball spawner
*/

var balls = [];

var gravityValue = 0.2;
var spawnBalls = false;
var notifications = new Notifications();

var options =
{
	Option: function(name, value, shortcut)
	{
		this.name = name;
		this.value = value;
		this.shortcut = shortcut;
		this.texte = createElement("span",this.name + " : " + this.shortcut + "<br />");
		this.texte.parent("options");
		this.texte.id(this.name);
	},

	toggle: function(shortcut)
	{
		for (var o in this)
		{
			if (shortcut == this[o].shortcut)
			{
				this[o].value = !this[o].value;
				this.updateColor(this[o]);
				notifications.addText("Toggled "+ this[o].name);
			}
		}
	},

	updateColor: function(optionToChange)
	{
		if (optionToChange.value)
		{
			optionToChange.texte.style("fontWeight","bold");
			optionToChange.texte.style("color","green");
		}
		else
		{
			optionToChange.texte.style("fontWeight","normal");
			optionToChange.texte.style("color","red");
		}
	},

	initiate: function()
	{
		this.randomSpeed = new this.Option("Random velocity", false,"R");
		this.oneBall = new this.Option("Spawn one ball", true,"O");
		this.gravity = new this.Option("Gravity", false,"G");
		this.collision = new this.Option("Collision", true,"C");
		this.unstuck = new this.Option("Unstuck balls", true,"U");
		this.paintBackground = new this.Option("Paint mode",false,"P");
		this.wall = new this.Option("Wall Collision", true,"W");
		this.blow = new this.Option("Mouse blow", false,"B");
		this.attraction = new this.Option("Mouse Attraction", false,"A");
		this.superAttraction = new this.Option("Super attraction", false,"A");
		for (var o in this)
		{
			if (this[o].texte) {
				this[o].texte.mouseClicked(this.toggle(this[o].shortcut));
			}
			if (this[o].value)
			{
				this.updateColor(this[o]);
			}
		}
	},

	reset: function()
	{
		for (var o in this)
		{
			if (this[o].value)
			{
				this[o].value = false;
				this.updateColor(this[o]);
			}
		}
	}
};

function setup()
{
	var canvas = createCanvas(1024,768);
	canvas.parent("#game");
	background(70,20,150);
	options.initiate();
}

function draw()
{
	if (!options.paintBackground.value)
	{
		background(70,20,150);
	}
	if (spawnBalls)
	{
		balls.push(new Ball(mouseX,mouseY,balls.length));
		if (options.oneBall.value)
		{
			spawnBalls = false;
		}
	}

	for (var i = balls.length - 1; i >= 0 ; i--) //Walls, bounce on the wall and/or remove out of bound balls (checking the array backward so that when an object is deleted from it, the next in the list isn’t skip (it’s automatically put in the deleted index))
	{
		if (options.wall.value) // Walls are activated
		{
			if (balls[i].isOutOfBound()) //remove balls that are going up, we need to do it just once !
			{
				balls.splice(i,1);
			}
			else
			{
				balls[i].bounce();
			}
		}
		else if (balls[i].isOutOfBound()) //balls exit the world
		{
			balls.splice(i,1);
		}
	}
	for (var i = 0; i < balls.length; i++) //Moves, tests collisions, displays balls.
	{
		if (options.attraction.value)
		{
			balls[i].attraction();
		}
		if (options.blow.value)
		{
			balls[i].blown();
		}
		if (options.collision.value) // collision detection
		{
			var ballsToCheck = [];
			for (var j = i+1; j < balls.length; j++)
			{
				if (balls[i].doesIntersect(balls[j])) // WORK IN PROGRESS
				{
					balls[i].bumpsInto(balls[j]);
				}
			}
		}
		balls[i].move();
		balls[i].display();
	}
	for (var i = 0; i < balls.length; i++)
	{
		balls[i].gotUnstuck = false;
	}
	notifications.display();
}

function keyPressed()
{
	//console.log("key pressed=" + String.fromCharCode(keyCode) + "=" + keyCode);
	if (String.fromCharCode(keyCode) == " ")
	{
			balls.splice(0,balls.length);
			background(70,20,150);
			notifications.addText("Removed all balls");
	}
	if (keyCode == 27)
	{
		console.log(keyCode);
		notifications.addText("Reset");
		options.reset();
	}
	else
	{
		options.toggle(String.fromCharCode(keyCode));
	}
}

function mousePressed()
{
	spawnBalls = true;
}

function mouseReleased()
{
	spawnBalls = false;
	for (var i = 0; i < balls.length; i++)
	{
		balls[i].release();
	}
}
