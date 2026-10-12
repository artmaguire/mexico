<script lang="ts">
	type Dish = { emoji: string; name: string; desc: string; tag: string; cat: string };

	const allDishes: Dish[] = [
		// Pork
		{ emoji: '🐷', name: 'Cochinita pibil', desc: 'Slow-roasted pork in achiote & sour orange — the #1 Yucatecan dish', tag: 'Pork', cat: 'pork' },
		{ emoji: '🐷', name: 'Poc chuc', desc: 'Grilled pork in sour orange & charred onions', tag: 'Pork', cat: 'pork' },
		{ emoji: '🌮', name: 'Tacos al pastor', desc: 'Spit-roasted pork with pineapple, coriander & onion', tag: 'Pork', cat: 'pork' },
		{ emoji: '🧀', name: 'Queso relleno', desc: 'Edam cheese stuffed with spiced minced pork', tag: 'Pork', cat: 'pork' },
		{ emoji: '🐖', name: 'Lomitos de Valladolid', desc: 'Pork tenderloin in tomato sauce with capers & olives', tag: 'Pork', cat: 'pork' },
		{ emoji: '🔥', name: 'Lechón al horno', desc: 'Whole roasted suckling pig, crispy skin', tag: 'Pork', cat: 'pork' },
		{ emoji: '🫘', name: 'Frijol con puerco', desc: 'Black bean stew with pork, rice & salsa', tag: 'Pork', cat: 'pork' },
		// Chicken
		{ emoji: '🐔', name: 'Pollo pibil', desc: 'Chicken in achiote, slow-cooked in banana leaf', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🫓', name: 'Salbutes', desc: 'Puffy fried tortillas with shredded chicken, pickled onion & avocado', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🫓', name: 'Panuchos', desc: 'Like salbutes but stuffed with black beans first', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🍲', name: 'Sopa de lima', desc: 'Lime soup with shredded chicken & crispy tortilla strips', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🌶️', name: 'Relleno negro', desc: 'Chicken in thick, dark, smoky chilli paste', tag: 'Chicken', cat: 'chicken' },
		{ emoji: '🫔', name: 'Tamales colados', desc: 'Silky corn tamales with chicken, steamed in banana leaf', tag: 'Chicken', cat: 'chicken' },
		// Beef
		{ emoji: '🐄', name: 'Tacos de bistec', desc: 'Grilled chopped beef steak tacos with onion & coriander', tag: 'Beef', cat: 'beef' },
		{ emoji: '🥩', name: 'Arrachera', desc: 'Marinated flank steak, grilled — served with tortillas', tag: 'Beef', cat: 'beef' },
		{ emoji: '🍲', name: 'Puchero', desc: 'Hearty beef & vegetable stew, Sunday family dish', tag: 'Beef', cat: 'beef' },
		{ emoji: '🌮', name: 'Tacos de cabeza', desc: 'Slow-cooked beef head meat — tender, rich. Street food classic', tag: 'Beef', cat: 'beef' },
		{ emoji: '🥙', name: 'Tortas de carne', desc: 'Beef sandwich in soft telera bread with avocado & chilli', tag: 'Beef', cat: 'beef' },
		// Veggie / Vegan
		{ emoji: '🌽', name: 'Elotes / esquites', desc: 'Grilled corn on the cob / in a cup with lime, chilli, mayo & cheese', tag: 'Veggie', cat: 'veggie' },
		{ emoji: '🥞', name: 'Marquesitas', desc: 'Crispy rolled crepes with cheese & Nutella — the street snack', tag: 'Veggie', cat: 'veggie' },
		{ emoji: '🫔', name: 'Tamales de elote', desc: 'Sweet corn tamales steamed in husks — often vegan', tag: 'Vegan', cat: 'veggie' },
		{ emoji: '🎃', name: 'Papadzules', desc: 'Tortillas in pumpkin-seed sauce with egg (ask without for vegan)', tag: 'Veggie', cat: 'veggie' },
		{ emoji: '🥑', name: 'Guacamole & totopos', desc: 'Fresh mashed avocado, lime, coriander with tortilla chips', tag: 'Vegan', cat: 'veggie' },
		{ emoji: '🥬', name: 'Chaya juice', desc: 'Local leaf (like spinach) blended with citrus — Yucatán superfood', tag: 'Vegan', cat: 'veggie' },
		{ emoji: '🍄', name: 'Tacos de nopal', desc: 'Grilled cactus paddle tacos — tangy, like green beans', tag: 'Vegan', cat: 'veggie' },
		// Drinks
		{ emoji: '🍺', name: 'Michelada', desc: 'Beer with lime, salt, chilli & Clamato — perfect in the heat', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🍯', name: 'Xtabentún', desc: "Anise-honey liqueur — Yucatán's signature spirit", tag: 'Drink', cat: 'drinks' },
		{ emoji: '🥛', name: 'Horchata', desc: 'Sweet rice-milk drink with cinnamon', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🥬', name: 'Agua de chaya', desc: 'Chaya leaf blended with lime & pineapple', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🥃', name: 'Mezcal', desc: 'Smoky agave spirit — try with orange & sal de gusano', tag: 'Drink', cat: 'drinks' },
		{ emoji: '🍹', name: 'Agua de jamaica', desc: 'Hibiscus iced tea — tart, refreshing, everywhere', tag: 'Drink', cat: 'drinks' },
	];

	const filters: { label: string; cat: string; active: string; inactive: string }[] = [
		{ label: '🌮 All', cat: 'all', active: 'bg-gray-800 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
		{ label: '🐷 Pork', cat: 'pork', active: 'bg-rose-600 text-white', inactive: 'bg-white text-rose-700 border border-rose-200' },
		{ label: '🐔 Chicken', cat: 'chicken', active: 'bg-amber-600 text-white', inactive: 'bg-white text-amber-700 border border-amber-200' },
		{ label: '🐄 Beef', cat: 'beef', active: 'bg-orange-700 text-white', inactive: 'bg-white text-orange-800 border border-orange-200' },
		{ label: '🥑 Veggie', cat: 'veggie', active: 'bg-emerald-600 text-white', inactive: 'bg-white text-emerald-700 border border-emerald-200' },
		{ label: '🍹 Drinks', cat: 'drinks', active: 'bg-blue-600 text-white', inactive: 'bg-white text-blue-700 border border-blue-200' },
	];

	let active = $state('all');
	let filtered = $derived(active === 'all' ? allDishes : allDishes.filter(d => d.cat === active));

	function tagClass(tag: string) {
		if (tag === 'Pork') return 'bg-rose-100 text-rose-700';
		if (tag === 'Chicken') return 'bg-amber-100 text-amber-700';
		if (tag === 'Beef') return 'bg-orange-100 text-orange-800';
		if (tag === 'Vegan') return 'bg-emerald-100 text-emerald-700';
		if (tag === 'Veggie') return 'bg-lime-100 text-lime-700';
		if (tag === 'Drink') return 'bg-blue-100 text-blue-700';
		return 'bg-gray-100 text-gray-700';
	}
</script>

<svelte:head><title>Food Guide · Mexico Trip</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="mb-1 text-2xl font-bold text-gray-900">🌮 Yucatán Food Guide</h1>
	<p class="mb-4 text-sm text-gray-500">What to eat · No fish 🚫🐟</p>

	<!-- Pill toggle -->
	<div class="mb-5 flex flex-wrap gap-2">
		{#each filters as f (f.cat)}
			<button
				onclick={() => active = f.cat}
				class="rounded-full px-4 py-2 text-sm font-medium shadow-sm transition active:scale-95 {active === f.cat ? f.active : f.inactive}"
			>{f.label}</button>
		{/each}
	</div>

	<!-- Dish grid -->
	<div class="grid gap-3 sm:grid-cols-2">
		{#each filtered as dish (dish.name)}
			<div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
				<span class="text-2xl">{dish.emoji}</span>
				<div class="min-w-0">
					<div class="flex items-center gap-2 flex-wrap">
						<h3 class="font-semibold text-gray-900">{dish.name}</h3>
						<span class="rounded-full px-2 py-0.5 text-[10px] font-medium {tagClass(dish.tag)}">{dish.tag}</span>
					</div>
					<p class="mt-1 text-sm text-gray-600">{dish.desc}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
