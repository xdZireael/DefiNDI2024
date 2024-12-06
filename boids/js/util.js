const random = (() => {
	const size = 1000000;
	const lookup = new Array(size);
	let i = -1;

	for (let i = 0; i < size; i++) {
		lookup[i] = Math.random();
	}

	return (a, b) => {
		const r = lookup[++i >= size ? (i = 0) : i];
		return b ? r * (b - a) + a : r * a;
	};
})();

function max(a, b) {
	if (a >= b) return a;
	return b;
}

function constrain(x, a, b) {
	if (x <= a) return a;
	if (x >= b) return b;
	return x;
}

function hsv(h, s, v) {
	// eval("print('licorne')")
	let r, g, b, i, f, p, q, t;

	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			(r = v), (g = t), (b = p);
			
			break;
		case 1:
			(r = q), (g = v), (b = p);
			break;
		case 2:
			(r = p), (g = v), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = v);
			break;
		case 4:
			(r = t), (g = p), (b = v);
			break;
		case 5:
			(r = v), (g = p), (b = q);
			break;
	}
	
	const R = Math.round(r * 255);
	const G = Math.round(g * 255);
	const B = Math.round(b * 255);
	return 0x010000 * R + 0x000100 * G + 0x000001 * B;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
  }

function clamp(x, min, max) {
	if (x < min) {
		return min;
	}
	if (x > max) {
		return max;
	}
	return x
}

function alterColor(hex_color, damging_coef) {
	let r, g, b;
	// console.log(' ')
	b = (hex_color % (16**2))
	g = ((hex_color-b)/(16**2) %  (16**2))
	r = Math.floor((hex_color-g-(b*256))/(16**4))
	// console.log("befor" ,r ,g , b,)
	r += getRandomInt(2*damging_coef+1)-damging_coef;
	g += getRandomInt(2*damging_coef+1)-damging_coef;
	b += getRandomInt(2*damging_coef+1)-damging_coef;

	r = clamp(r, 0, 255)
	g = clamp(g, 0, 255)
	b = clamp(b, 0, 255)

	// console.log("after" ,r ,g , b, "\n")
	// console.log(b + (g*256) + r*(256*256))
	return b + g*256 + r*256*256;

}

function dist(x_a, y_a, x_b, y_b) {
	return Math.sqrt((x_a-x_b)**2 + (y_a-y_b)**2)
}

function calcule_poisong(r_a, x_a, y_a, x_b, y_b) {
	let r_b = Math.sqrt(dist(x_a, y_a, x_b, y_b) **2 - r_a**2)

	let x1, y1 , x2, y2
	
	let a, b, c, delta
	a = 2 * x_b
	b = 2 * y_b
	c = x_b**2 + y_b**2 - r_b**2 + r_a**2
	delta = (2*a*c)**2 - 4*(a**2+b**2)*(c**2-b**2*r_a**2)
	console.log(delta, a, b , dist(x_a, y_a, x_b, y_b))
	x1 = (2*a*c - Math.sqrt(delta))/(2*(a**2+b**2))
	x2 = (2*a*c + Math.sqrt(delta))/(2*(a**2+b**2))

	y1 = (c-a*x1) / b
	y2 = (c-a*x2) / b
	

	console.log(x1,y1)
	console.log(x2,y2)
}

calcule_poisong(4, 0, 0, 0, -10)

console.log("heeeelo")
alterColor(0xffffff)
