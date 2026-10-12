<script lang="ts">
	import MexFlag from '#lib/MexFlag.svelte';

	let tab = $state<'food' | 'phrases'>('food');

	// ===== FOOD DATA =====
	type Dish = { emoji: string; name: string; desc: string; tag: string; cat: string };
	const allDishes: Dish[] = [
		{ emoji: '🐷', name: 'Cochinita pibil', desc: 'Slow-roasted pork in achiote & sour orange — the #1 Yucatecan dish', tag: 'Pork', cat: 'pork' },
		{ emoji: '🐷', name: 'Poc chuc', desc: 'Grilled pork in sour orange & charred onions', tag: 'Pork', cat: 'pork' },
		{ emoji: '🌮', name: 'Tacos al pastor', desc: 'Spit-roasted pork with pineapple, coriander & onion', tag: 'Pork', cat: 'pork' },
		{ emoji: '🧀', name: 'Queso relleno', desc: 'Edam cheese stuffed with spiced minced pork', tag: 'Pork', cat: 'pork' },
		{ emoji: '🐖', name: 'Lomitos de Valladolid', desc: 'Pork tenderloin in tomato sauce with capers & olives', tag: 'Pork', cat: 'pork' },
		{ emoji: '🔥', name: 'Lechón al horno', desc: 'Whole roasted suckling pig, crispy skin', tag: 'Pork', cat: 'pork' },
		{ emoji: '🫘', name: 'Frijol con puerco', desc: 'Black bean stew with pork, rice & salsa', tag: 'Pork', cat: 'pork' },
		{ emoji: '🐔', name: 'Pollo pibil', desc: 'Chicken in achiote, slow-cooked in banana leaf', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🫓', name: 'Salbutes', desc: 'Puffy fried tortillas with shredded chicken, pickled onion & avocado', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🫓', name: 'Panuchos', desc: 'Like salbutes but stuffed with black beans first', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🍲', name: 'Sopa de lima', desc: 'Lime soup with shredded chicken & crispy tortilla strips', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🌶️', name: 'Relleno negro', desc: 'Chicken in thick, dark, smoky chilli paste', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🫔', name: 'Tamales colados', desc: 'Silky corn tamales with chicken, steamed in banana leaf', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🐄', name: 'Tacos de bistec', desc: 'Grilled chopped beef steak tacos with onion & coriander', tag: 'Beef', cat: 'beef' },
		{ emoji: '🥩', name: 'Arrachera', desc: 'Marinated flank steak, grilled — served with tortillas', tag: 'Beef', cat: 'beef' },
		{ emoji: '🍲', name: 'Puchero', desc: 'Hearty beef & vegetable stew, Sunday family dish', tag: 'Beef', cat: 'beef' },
		{ emoji: '🌮', name: 'Tacos de cabeza', desc: 'Slow-cooked beef head meat — tender, rich. Street food classic', tag: 'Beef', cat: 'beef' },
		{ emoji: '🥙', name: 'Tortas de carne', desc: 'Beef sandwich in soft telera bread with avocado & chilli', tag: 'Beef', cat: 'beef' },
		{ emoji: '🌽', name: 'Elotes / esquites', desc: 'Grilled corn with lime, chilli, mayo & cheese', tag: 'Veggie', cat: 'veggie' },
		{ emoji: '🥞', name: 'Marquesitas', desc: 'Crispy rolled crepes with cheese & Nutella', tag: 'Veggie', cat: 'veggie' },
		{ emoji: '🫔', name: 'Tamales de elote', desc: 'Sweet corn tamales steamed in husks', tag: 'Vegan', cat: 'veggie' },
		{ emoji: '🎃', name: 'Papadzules', desc: 'Tortillas in pumpkin-seed sauce', tag: 'Veggie', cat: 'veggie' },
		{ emoji: '🥑', name: 'Guacamole & totopos', desc: 'Fresh avocado, lime, coriander with chips', tag: 'Vegan', cat: 'veggie' },
		{ emoji: '🍄', name: 'Tacos de nopal', desc: 'Grilled cactus paddle tacos — tangy', tag: 'Vegan', cat: 'veggie' },
		{ emoji: '🍺', name: 'Michelada', desc: 'Beer with lime, salt, chilli & Clamato', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🍯', name: 'Xtabentún', desc: 'Anise-honey liqueur — Yucatán spirit', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🥛', name: 'Horchata', desc: 'Sweet rice-milk drink with cinnamon', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🥬', name: 'Agua de chaya', desc: 'Chaya leaf with lime & pineapple', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🥃', name: 'Mezcal', desc: 'Smoky agave spirit — with orange & sal de gusano', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🍹', name: 'Agua de jamaica', desc: 'Hibiscus iced tea — tart, refreshing', tag: 'Drink', cat: 'drinks' },
	];
	const foodFilters = [
		{ label: '🌮 All', cat: 'all', active: 'bg-gray-800 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
		{ label: '🐷 Pork', cat: 'pork', active: 'bg-rose-600 text-white', inactive: 'bg-white text-rose-700 border border-rose-200' },
		{ label: '🐔 Chicken', cat: 'chicken', active: 'bg-amber-600 text-white', inactive: 'bg-white text-amber-700 border border-amber-200' },
		{ label: '🐄 Beef', cat: 'beef', active: 'bg-orange-700 text-white', inactive: 'bg-white text-orange-800 border border-orange-200' },
		{ label: '🥑 Veggie', cat: 'veggie', active: 'bg-emerald-600 text-white', inactive: 'bg-white text-emerald-700 border border-emerald-200' },
		{ label: '🍹 Drinks', cat: 'drinks', active: 'bg-blue-600 text-white', inactive: 'bg-white text-blue-700 border border-blue-200' },
	];
	let foodCat = $state('all');
	let filteredFood = $derived(foodCat === 'all' ? allDishes : allDishes.filter(d => d.cat === foodCat));

	function tagClass(tag: string) {
		const m: Record<string, string> = { Pork: 'bg-rose-100 text-rose-700', Chicken: 'bg-amber-100 text-amber-700', Beef: 'bg-orange-100 text-orange-800', Vegan: 'bg-emerald-100 text-emerald-700', Veggie: 'bg-lime-100 text-lime-700', Drink: 'bg-blue-100 text-blue-700' };
		return m[tag] ?? 'bg-gray-100 text-gray-700';
	}

	// ===== PHRASES DATA =====
	type Phrase = { es: string; en: string; say: string; cat: string };
	const phrases: Phrase[] = [
		{ es: 'Hola', en: 'Hello', say: 'OH-la', cat: 'basics' },
		{ es: 'Buenos días', en: 'Good morning', say: 'BWEH-nos DEE-as', cat: 'basics' },
		{ es: 'Buenas tardes', en: 'Good afternoon', say: 'BWEH-nas TAR-des', cat: 'basics' },
		{ es: 'Buenas noches', en: 'Good evening / night', say: 'BWEH-nas NO-ches', cat: 'basics' },
		{ es: 'Por favor', en: 'Please', say: 'por fa-VOR', cat: 'basics' },
		{ es: 'Gracias', en: 'Thank you', say: 'GRA-see-as', cat: 'basics' },
		{ es: 'Muchas gracias', en: 'Thank you very much', say: 'MOO-chas GRA-see-as', cat: 'basics' },
		{ es: 'De nada', en: "You're welcome", say: 'de NA-da', cat: 'basics' },
		{ es: 'Perdón', en: 'Sorry / Excuse me', say: 'per-DON', cat: 'basics' },
		{ es: 'Sí / No', en: 'Yes / No', say: 'see / no', cat: 'basics' },
		{ es: 'No entiendo', en: "I don't understand", say: 'no en-tee-EN-do', cat: 'basics' },
		{ es: '¿Habla inglés?', en: 'Do you speak English?', say: 'AH-bla in-GLES', cat: 'basics' },
		{ es: 'Adiós', en: 'Goodbye', say: 'ad-ee-OHS', cat: 'basics' },
		{ es: 'Sin pescado, por favor', en: 'Without fish, please', say: 'seen pes-KA-do', cat: 'food' },
		{ es: 'Sin mariscos', en: 'Without seafood', say: 'seen ma-REES-kos', cat: 'food' },
		{ es: 'Pollo, por favor', en: 'Chicken, please', say: 'PO-yo', cat: 'food' },
		{ es: 'Carne de res', en: 'Beef', say: 'KAR-neh de res', cat: 'food' },
		{ es: 'La cuenta, por favor', en: 'The bill, please', say: 'la KWEN-ta', cat: 'food' },
		{ es: '¿Cuánto cuesta?', en: 'How much?', say: 'KWAN-to KWES-ta', cat: 'food' },
		{ es: 'Una mesa para dos', en: 'A table for two', say: 'OO-na MEH-sa PA-ra dos', cat: 'food' },
		{ es: 'Agua, por favor', en: 'Water, please', say: 'AH-gwa', cat: 'food' },
		{ es: 'Dos cervezas', en: 'Two beers', say: 'dos ser-VEH-sas', cat: 'food' },
		{ es: '¿Es picante?', en: 'Is it spicy?', say: 'es pee-KAN-teh', cat: 'food' },
		{ es: 'Está delicioso', en: "It's delicious", say: 'es-TA de-lee-see-OH-so', cat: 'food' },
		{ es: '¿Dónde está...?', en: 'Where is...?', say: 'DON-deh es-TA', cat: 'travel' },
		{ es: '¿Dónde está el baño?', en: 'Where is the toilet?', say: 'DON-deh es-TA el BA-nyo', cat: 'travel' },
		{ es: 'Un boleto a Tulum', en: 'One ticket to Tulum', say: 'oon bo-LEH-to a too-LOOM', cat: 'travel' },
		{ es: '¿A qué hora sale?', en: 'What time does it leave?', say: 'a keh OH-ra SA-leh', cat: 'travel' },
		{ es: 'Aquí, por favor', en: 'Here, please (to stop)', say: 'a-KEE', cat: 'travel' },
		{ es: 'Tengo una reserva', en: 'I have a reservation', say: 'TEN-go OO-na re-SER-va', cat: 'travel' },
		{ es: 'Ayuda!', en: 'Help!', say: 'a-YOO-da', cat: 'useful' },
		{ es: 'Estoy perdido/a', en: "I'm lost", say: 'es-TOY per-DEE-do', cat: 'useful' },
		{ es: 'No, gracias', en: 'No, thank you', say: 'no GRA-see-as', cat: 'useful' },
		{ es: '¿Acepta tarjeta?', en: 'Do you accept card?', say: 'a-SEP-ta tar-HEH-ta', cat: 'useful' },
		{ es: 'Solo efectivo', en: 'Cash only', say: 'SO-lo e-fek-TEE-vo', cat: 'useful' },
		{ es: '¿Hay wifi?', en: 'Is there wifi?', say: 'eye WEE-fee', cat: 'useful' },
	];
	const phraseFilters = [
		{ label: '🗣️ All', cat: 'all', active: 'bg-gray-800 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
		{ label: '👋 Basics', cat: 'basics', active: 'bg-cyan-600 text-white', inactive: 'bg-white text-cyan-700 border border-cyan-200' },
		{ label: '🍽️ Food', cat: 'food', active: 'bg-amber-600 text-white', inactive: 'bg-white text-amber-700 border border-amber-200' },
		{ label: '🚌 Travel', cat: 'travel', active: 'bg-purple-600 text-white', inactive: 'bg-white text-purple-700 border border-purple-200' },
		{ label: '🆘 Useful', cat: 'useful', active: 'bg-rose-600 text-white', inactive: 'bg-white text-rose-700 border border-rose-200' },
	];
	let phraseCat = $state('all');
	let filteredPhrases = $derived(phraseCat === 'all' ? phrases : phrases.filter(p => p.cat === phraseCat));
</script>

<svelte:head><title>Local · Mexico Trip</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
		<MexFlag size={26} />
		Local
	</h1>

	<!-- Tabs -->
	<div class="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
		<button onclick={() => tab = 'food'} class="flex-1 rounded-lg py-2.5 text-sm font-medium transition {tab === 'food' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}">🌮 Food Guide</button>
		<button onclick={() => tab = 'phrases'} class="flex-1 rounded-lg py-2.5 text-sm font-medium transition {tab === 'phrases' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}">🗣️ Phrases</button>
	</div>

	{#if tab === 'food'}
		<p class="mb-3 text-sm text-gray-500">What to eat · No fish 🚫🐟</p>
		<div class="mb-4 flex flex-wrap gap-2">
			{#each foodFilters as f (f.cat)}
				<button onclick={() => foodCat = f.cat} class="rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition active:scale-95 {foodCat === f.cat ? f.active : f.inactive}">{f.label}</button>
			{/each}
		</div>
		<div class="grid gap-2 sm:grid-cols-2">
			{#each filteredFood as dish (dish.name)}
				<div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
					<span class="text-2xl">{dish.emoji}</span>
					<div class="min-w-0">
						<div class="flex items-center gap-2 flex-wrap">
							<h3 class="font-semibold text-gray-900 text-sm">{dish.name}</h3>
							<span class="rounded-full px-1.5 py-0.5 text-[10px] font-medium {tagClass(dish.tag)}">{dish.tag}</span>
						</div>
						<p class="mt-0.5 text-xs text-gray-600">{dish.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mb-3 text-sm text-gray-500">Simple Spanish for getting by</p>
		<div class="mb-4 flex flex-wrap gap-2">
			{#each phraseFilters as f (f.cat)}
				<button onclick={() => phraseCat = f.cat} class="rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition active:scale-95 {phraseCat === f.cat ? f.active : f.inactive}">{f.label}</button>
			{/each}
		</div>
		<div class="grid gap-2 sm:grid-cols-2">
			{#each filteredPhrases as p (p.es)}
				<div class="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
					<div class="font-semibold text-gray-900 text-sm">{p.es}</div>
					<div class="text-xs text-gray-600">{p.en}</div>
					<div class="mt-0.5 text-[11px] italic text-cyan-600">🔊 {p.say}</div>
				</div>
			{/each}
		</div>
		<div class="mt-4 rounded-xl border-l-4 border-cyan-400 bg-white p-3 shadow-sm">
			<h3 class="text-xs font-semibold text-gray-900">💡 Pronunciation</h3>
			<p class="mt-1 text-xs text-gray-600"><strong>j</strong>=throaty h · <strong>ll</strong>=y · <strong>ñ</strong>=ny · <strong>h</strong>=silent · <strong>v</strong>=soft b</p>
		</div>
	{/if}
</div>
