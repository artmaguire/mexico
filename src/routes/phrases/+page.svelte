<script lang="ts">
	type Phrase = { es: string; en: string; say: string; cat: string };

	const phrases: Phrase[] = [
		// Basics
		{ es: 'Hola', en: 'Hello', say: 'OH-la', cat: 'basics' },
		{ es: 'Buenos días', en: 'Good morning', say: 'BWEH-nos DEE-as', cat: 'basics' },
		{ es: 'Buenas tardes', en: 'Good afternoon', say: 'BWEH-nas TAR-des', cat: 'basics' },
		{ es: 'Buenas noches', en: 'Good evening / night', say: 'BWEH-nas NO-ches', cat: 'basics' },
		{ es: 'Por favor', en: 'Please', say: 'por fa-VOR', cat: 'basics' },
		{ es: 'Gracias', en: 'Thank you', say: 'GRA-see-as', cat: 'basics' },
		{ es: 'Muchas gracias', en: 'Thank you very much', say: 'MOO-chas GRA-see-as', cat: 'basics' },
		{ es: 'De nada', en: "You're welcome", say: 'de NA-da', cat: 'basics' },
		{ es: 'Perdón / Disculpe', en: 'Sorry / Excuse me', say: 'per-DON / dis-KOOL-peh', cat: 'basics' },
		{ es: 'Sí / No', en: 'Yes / No', say: 'see / no', cat: 'basics' },
		{ es: 'No entiendo', en: "I don't understand", say: 'no en-tee-EN-do', cat: 'basics' },
		{ es: '¿Habla inglés?', en: 'Do you speak English?', say: 'AH-bla in-GLES', cat: 'basics' },
		{ es: 'Adiós / Hasta luego', en: 'Goodbye / See you later', say: 'ad-ee-OHS / AS-ta LWEH-go', cat: 'basics' },

		// Food — the important ones!
		{ es: 'Sin pescado, por favor', en: 'Without fish, please', say: 'seen pes-KA-do', cat: 'food' },
		{ es: 'Sin mariscos', en: 'Without seafood', say: 'seen ma-REES-kos', cat: 'food' },
		{ es: '¿Tiene carne de cerdo?', en: 'Do you have pork?', say: 'tee-EH-neh KAR-neh de SER-do', cat: 'food' },
		{ es: 'Pollo, por favor', en: 'Chicken, please', say: 'PO-yo', cat: 'food' },
		{ es: 'Carne de res', en: 'Beef', say: 'KAR-neh de res', cat: 'food' },
		{ es: 'Vegetariano / Vegano', en: 'Vegetarian / Vegan', say: 've-he-ta-ree-AH-no / ve-GA-no', cat: 'food' },
		{ es: 'La cuenta, por favor', en: 'The bill, please', say: 'la KWEN-ta', cat: 'food' },
		{ es: '¿Cuánto cuesta?', en: 'How much does it cost?', say: 'KWAN-to KWES-ta', cat: 'food' },
		{ es: 'Una mesa para dos', en: 'A table for two', say: 'OO-na MEH-sa PA-ra dos', cat: 'food' },
		{ es: 'Agua, por favor', en: 'Water, please', say: 'AH-gwa', cat: 'food' },
		{ es: 'Dos cervezas', en: 'Two beers', say: 'dos ser-VEH-sas', cat: 'food' },
		{ es: '¿Es picante?', en: 'Is it spicy?', say: 'es pee-KAN-teh', cat: 'food' },
		{ es: 'Está delicioso', en: "It's delicious", say: 'es-TA de-lee-see-OH-so', cat: 'food' },
		{ es: 'Para llevar', en: 'To take away', say: 'PA-ra yeh-VAR', cat: 'food' },

		// Getting around
		{ es: '¿Dónde está...?', en: 'Where is...?', say: 'DON-deh es-TA', cat: 'travel' },
		{ es: '¿Dónde está el baño?', en: 'Where is the toilet?', say: 'DON-deh es-TA el BA-nyo', cat: 'travel' },
		{ es: '¿Cuánto cuesta el boleto?', en: 'How much is the ticket?', say: 'KWAN-to KWES-ta el bo-LEH-to', cat: 'travel' },
		{ es: 'Un boleto a Tulum', en: 'One ticket to Tulum', say: 'oon bo-LEH-to a too-LOOM', cat: 'travel' },
		{ es: '¿A qué hora sale?', en: 'What time does it leave?', say: 'a keh OH-ra SA-leh', cat: 'travel' },
		{ es: '¿Está lejos?', en: 'Is it far?', say: 'es-TA LEH-hos', cat: 'travel' },
		{ es: 'Aquí, por favor', en: 'Here, please (to stop)', say: 'a-KEE', cat: 'travel' },
		{ es: 'La parada', en: 'The bus stop', say: 'la pa-RA-da', cat: 'travel' },
		{ es: 'El aeropuerto', en: 'The airport', say: 'el a-eh-ro-PWER-to', cat: 'travel' },
		{ es: 'Tengo una reserva', en: 'I have a reservation', say: 'TEN-go OO-na re-SER-va', cat: 'travel' },

		// Useful / emergencies
		{ es: 'Ayuda!', en: 'Help!', say: 'a-YOO-da', cat: 'useful' },
		{ es: 'Necesito un doctor', en: 'I need a doctor', say: 'ne-se-SEE-to oon dok-TOR', cat: 'useful' },
		{ es: 'Estoy perdido/a', en: "I'm lost", say: 'es-TOY per-DEE-do', cat: 'useful' },
		{ es: '¿Puede ayudarme?', en: 'Can you help me?', say: 'PWEH-deh a-yoo-DAR-meh', cat: 'useful' },
		{ es: 'No, gracias', en: 'No, thank you (to hawkers)', say: 'no GRA-see-as', cat: 'useful' },
		{ es: 'Solo estoy mirando', en: "I'm just looking", say: 'SO-lo es-TOY mee-RAN-do', cat: 'useful' },
		{ es: '¿Acepta tarjeta?', en: 'Do you accept card?', say: 'a-SEP-ta tar-HEH-ta', cat: 'useful' },
		{ es: 'Solo efectivo', en: 'Cash only', say: 'SO-lo e-fek-TEE-vo', cat: 'useful' },
		{ es: '¿Hay wifi?', en: 'Is there wifi?', say: 'eye WEE-fee', cat: 'useful' },
		{ es: 'Muy caro', en: 'Very expensive', say: 'mooy KA-ro', cat: 'useful' },
	];

	const filters: { label: string; cat: string; active: string; inactive: string }[] = [
		{ label: '🗣️ All', cat: 'all', active: 'bg-gray-800 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
		{ label: '👋 Basics', cat: 'basics', active: 'bg-cyan-600 text-white', inactive: 'bg-white text-cyan-700 border border-cyan-200' },
		{ label: '🍽️ Food', cat: 'food', active: 'bg-amber-600 text-white', inactive: 'bg-white text-amber-700 border border-amber-200' },
		{ label: '🚌 Travel', cat: 'travel', active: 'bg-purple-600 text-white', inactive: 'bg-white text-purple-700 border border-purple-200' },
		{ label: '🆘 Useful', cat: 'useful', active: 'bg-rose-600 text-white', inactive: 'bg-white text-rose-700 border border-rose-200' },
	];

	let active = $state('all');
	let filtered = $derived(active === 'all' ? phrases : phrases.filter(p => p.cat === active));
</script>

<svelte:head><title>Spanish Phrases · Mexico Trip</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="mb-1 text-2xl font-bold text-gray-900">🗣️ Spanish Phrases</h1>
	<p class="mb-4 text-sm text-gray-500">Simple Spanish for getting by · say it as written</p>

	<!-- Pill toggle -->
	<div class="mb-5 flex flex-wrap gap-2">
		{#each filters as f (f.cat)}
			<button
				onclick={() => active = f.cat}
				class="rounded-full px-4 py-2 text-sm font-medium shadow-sm transition active:scale-95 {active === f.cat ? f.active : f.inactive}"
			>{f.label}</button>
		{/each}
	</div>

	<!-- Phrase cards -->
	<div class="grid gap-2 sm:grid-cols-2">
		{#each filtered as p (p.es)}
			<div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
				<div class="font-semibold text-gray-900">{p.es}</div>
				<div class="text-sm text-gray-600">{p.en}</div>
				<div class="mt-1 text-xs italic text-cyan-600">🔊 {p.say}</div>
			</div>
		{/each}
	</div>

	<!-- Pronunciation note -->
	<div class="mt-6 rounded-xl border-l-4 border-cyan-400 bg-white p-4 shadow-sm">
		<h2 class="text-sm font-semibold text-gray-900">💡 Quick pronunciation tips</h2>
		<ul class="mt-2 space-y-1 text-sm text-gray-600">
			<li><strong>j</strong> = throaty 'h' — <em>jalapeño</em> = ha-la-PEH-nyo</li>
			<li><strong>ll</strong> = 'y' — <em>pollo</em> = PO-yo</li>
			<li><strong>ñ</strong> = 'ny' — <em>mañana</em> = ma-NYA-na</li>
			<li><strong>h</strong> = silent — <em>hola</em> = OH-la</li>
			<li><strong>v</strong> = soft 'b' — <em>cerveza</em> = ser-VEH-sa</li>
		</ul>
	</div>
</div>
