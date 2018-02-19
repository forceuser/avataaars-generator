const Avataaars = require("avataaars-pure-js");

function hash (val) {
	val = val != null ? val.toString() : val;
	let hash = 0;
	if (val.length == 0) {
		return hash;
	}
	for (let i = 0; i < val.length; i++) {
		const char = val.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

module.exports = function (id, gender) {
	id = id || Avataaars.random.getRandomInt(1, Number.MAX_VALUE);
	console.log("id", id, "gender", gender);
	return Avataaars.random(Avataaars.avatar, null, (values, {path}, original) => {
		const randomVal = (collection, max) => {
			const h = hash(gender + "~" + id + "~" + path);
			if (max != null) {
				return h % max;
			}
			const keys = Object.keys(collection);

			return collection[keys[h % keys.length]];
		};

		// if (norestriction) {
		// 	return randomVal(values);
		// }

		if (path === "avatarStyle") {
			return original.indexOf("circle");
		}

		if (path === "body.color") {
			return randomVal(["pale", "light", "brown"]);
		}
		// if (path === "eyes") {
		// 	return randomVal(values.filter(val => !["cry", "dizzy", "hearts"].includes(val)));
		// }
		//
		// if (path === "mouth") {
		// 	return randomVal(values.filter(val => !["vomit", "sad", "disbelief", "grimace", "concerned", "serious", "screamOpen", "eating"].includes(val)));
		// }
		if (path === "facialHair") {
			if (gender === "F") {
				return null;
			}
			else {
				if (randomVal(0, 5) === 0) {
					return randomVal(values.filter(val => val !== "blank"));
				}
				else {
					return null;
				}
			}

		}
		if (path === "eyebrow") {
			values = values.filter(val => !["unibrowNatural"].includes(val) && !val.startsWith("sad"));
			if (gender === "F") {
				return randomVal(values.filter(val => !["unibrowNatural"].includes(val)));
			}
		}

		if (path === "top") {
			if (gender === "F") {
				values = values.filter(val => val.startsWith("long") && !["longHairFroBand", "longHairFro", "hijab", "turban"].includes(val));
			}
			else if (gender === "M") {
				values = values.filter(val => !val.startsWith("long") && !["hijab", "turban"].includes(val));
			}
		}
		if (path === "accessory") {
			if (randomVal(0, 6) === 0) {
				return randomVal(values.filter(val => val !== "blank"));
			}
			else {
				return null;
			}
		}
		return randomVal(values);
	}).render();
};
