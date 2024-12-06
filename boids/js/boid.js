class Boid extends V2D {
	constructor(index) {
		super(random(g.width), random(g.height));
		
		this.color_boid = alterColor(0x263885, 30)

		this.vel = V2D.random(random(opt.minSpeed, opt.maxSpeed));
		this.acc = new V2D();

		this.index = index;

		this.shape = new PIXI.Graphics();
		this.shapeMode = null;

		this.desired = new PIXI.Graphics();
		this.desired.clear();
		this.desired.beginFill();
		this.desired.lineStyle(2, hsv(0.9, 5, 1));
		this.desired.moveTo(0, 0);
		this.desired.lineTo(24, 0);
		this.desired.endFill();
		this.desired.alpha = 0;

		app.stage.addChild(this.shape);
		app.stage.addChild(this.desired);
	}

	neighbors(flock) {
		const cands = flock.candidates(this);
		const ns = [];
		const ds = [];

		const candidate_count = cands
			.map(c => c.length)
			.reduce((a, b) => a + b, 0);
		let step =
			opt.accuracy === 0 ? 1 : Math.ceil(candidate_count / opt.accuracy);
		let i = Math.floor(random(step));

		for (const c of cands) {
			for (; i < c.length; i += step) {
				if (this === c[i]) continue;

				const d = this.sqrDist(c[i]);
				if (d < g.sqVis) {
					ns.push(c[i]);
					ds.push(d);
				}
			}
			i -= c.length;
		}

		return [ns, ds];
	}

	flock(flock) {
		this.acc.zero();

		const aln = new V2D();
		const csn = new V2D();
		const sep = new V2D();

		let [ns, ds] = this.neighbors(flock);

		let i = 0;
		for (const other of ns) {
			// alignment is the average of velocity * bias strength ^ dot
			const b = opt.bias ** other.vel.dot(this.vel);
			aln.sclAdd(other.vel, b);

			// cohesion finds the average of positions
			csn.add(other);

			// separation is stronger for closer boids, so it's multiplied by d
			const d = 1 / (ds[i] || 0.00001);
			sep.x += (this.x - other.x) * d;
			sep.y += (this.y - other.y) * d;

			i++;
		}

		if (ns.length > 0) {
			aln.setMag(opt.maxSpeed).sub(this.vel).max(opt.maxForce);

			csn.div(ns.length)
				.sub(this)
				.setMag(opt.maxSpeed)
				.sub(this.vel)
				.max(opt.maxForce);

			sep.setMag(opt.maxSpeed).sub(this.vel).max(opt.maxForce);
		}

		this.acc.sclAdd(aln, opt.alignment);
		this.acc.sclAdd(csn, opt.cohesion);
		this.acc.sclAdd(sep, opt.separation);
	}

	interact() {
		if (opt.particle || opt.vision === 0) {
			this.acc.zero();
		}

		if (g.mouse.down && g.mouse.over) {
			const mv = new V2D(g.mouse.x, g.mouse.y);

			const d = mv.sqrDist(this);

			mv.sub(this)
				.setMag(10000 / (d || 1))
				.max(g.mouseForce);

			if (g.mouse.button === 0) {
				this.acc.add(mv);
			} else if (g.mouse.button === 2) {
				this.acc.sub(mv);
			}
		}

		if (g.explode > 0.001) {
			const ev = g.explodePos.clone();

			const d = ev.sqrDist(this);

			ev.sub(this)
				.setMag((g.explode * 100000) / (d || 1))
				.max(g.mouseForce * 3);

			this.acc.sub(ev);
		}
	}

	update() {
		this.vel.sclAdd(this.acc, g.delta);

		if (opt.drag) this.vel.mult(1 - opt.drag);

		if (opt.noise) this.vel.rotate(random(-g.noiseRange, g.noiseRange));

		if (opt.minSpeed) {
			if (this.vel.sqrMag() === 0) this.vel.random(opt.minSpeed);
			else this.vel.min(opt.minSpeed);
		}

		this.vel.max(opt.maxSpeed);
		this.sclAdd(this.vel, g.delta);

		if (opt.bounce) {
			let ran = false;
			if (this.x < 0 || this.x > g.width) {
				ran = true;
				this.vel.x *= -1;
			}
			if (this.y < 0 || this.y > g.height) {
				ran = true;
				this.vel.y *= -1;
			}
			if (ran) {
				this.x = constrain(this.x, 0, g.width);
				this.y = constrain(this.y, 0, g.height);
			}
		} else {
			if (this.x < 0) this.x = g.width;
			if (this.x > g.width) this.x = 0;
			if (this.y < 0) this.y = g.height;
			if (this.y > g.height) this.y = 0;
		}
	}

	show() {
		this.shape = this.getShape();
		this.shape.x = this.x;
		this.shape.y = this.y;
		this.shape.rotation = this.vel.angle();

		if (opt.hues)
			this.shape.tint = hsv(
				constrain(this.vel.mag() / (opt.maxSpeed * 2), 0, 1),
				1,
				1
			);
		else this.shape.tint = 0xffffff;

		if (opt.desired && this.acc.sqrMag() > 0.01) {
			this.desired.alpha = 1;
			this.desired.x = this.x;
			this.desired.y = this.y;
			this.desired.rotation = this.acc.angle();
		} else this.desired.alpha = 0;
	}

	getShape() {
		if (this.shapeMode !== g.shapeMode) {
			this.shape.clear();

			if (!opt.hideBoids) {
				this.shape.beginFill(this.color_boid);
				this.shape.lineStyle();

				this.shape.moveTo(-1.6, 3.66606);
				this.shape.lineTo(-1.6, -3.66606);
				this.shape.lineTo(-6, -1);
				this.shape.lineTo(-6, -1);
				this.shape.lineTo(-9, -4);
				this.shape.lineTo(-9, 4);
				this.shape.lineTo(-6, 1);
				this.shape.lineTo(-1.6, 3.66606);

				this.shape.drawCircle(0, 0, 4)

				this.shape.endFill();
				
				this.shape.beginFill(0);
				this.shape.drawCircle(1.5,2,1)

				this.shape.scale.set(2,2)
			}

			if (opt.areas || opt.outlines) {
				this.shape.beginFill(0xffffff, opt.areas ? 0.03 : 0);
				this.shape.lineStyle(opt.outlines ? 0.5 : 0, 0xffffff, 0.2);
				this.shape.drawCircle(
					0,
					0,
					opt.halfAreas ? opt.vision / 2 : opt.vision
				);
				this.shape.endFill();
			}

			this.shape.alpha = 1;

			this.shapeMode = g.shapeMode;
		}

		return this.shape;
	}

	destroy() {
		this.shape.destroy();
		this.desired.destroy();
	}
}
