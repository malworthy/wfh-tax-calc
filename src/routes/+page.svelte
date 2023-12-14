<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	const getCurrentYear = () => {
		const now = new Date();
		const year = now.getFullYear();
		return now > new Date(year, 6 - 1, 30) ? year : year - 1;
	};

	let fyear = getCurrentYear();
	let months = [
		{ name: 'Jul', index: 7, year: fyear },
		{ name: 'Aug', index: 8, year: fyear },
		{ name: 'Sep', index: 9, year: fyear },
		{ name: 'Oct', index: 10, year: fyear },
		{ name: 'Nov', index: 11, year: fyear },
		{ name: 'Dec', index: 12, year: fyear },
		{ name: 'Jan', index: 1, year: fyear + 1 },
		{ name: 'Feb', index: 2, year: fyear + 1 },
		{ name: 'Mar', index: 3, year: fyear + 1 },
		{ name: 'Apr', index: 4, year: fyear + 1 },
		{ name: 'May', index: 5, year: fyear + 1 },
		{ name: 'Jun', index: 6, year: fyear + 1 }
	];
	let days = [...Array(31).keys()].map((x) => x + 1);

	let wfhDays = [];
	let timestamp = null;
	let scheduleCount = 0;
	let hoursPerDay = 7.6;

	onMount(async () => {
		await loadData();
	});

	const fyearChange = async () => {
		await save();
		await loadData();
	};

	const loadData = async () => {
		const response = await fetch(`/api?fyear=${fyear}`);
		const result = await response.json();
		//console.log(result);
		wfhDays = result;
	};

	const dayName = (d, m, y) => {
		const name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const date = new Date(y, m - 1, d);
		if (date.getMonth() != m - 1) return '---';
		return name[date.getDay()];
	};

	const handleClick = (mon, day) => {
		const i = wfhDays.findIndex((x) => x.day == day && x.month == mon.index && x.year == mon.year);
		if (i >= 0) {
			//wfhDays.splice(i,1);
			wfhDays[i].hasChanged = true;
			wfhDays[i].status = wfhDays[i].status == 0 ? 1 : 0;
			wfhDays = [...wfhDays];
		} else {
			wfhDays = [
				...wfhDays,
				{ day: day, month: mon.index, year: mon.year, fyear: fyear, hasChanged: true, status: 1 }
			];
		}

		//queue to save
		const current = new Date();
		if (timestamp == null || current - timestamp < 1000) {
			timestamp = new Date();
			scheduleCount++;
			setTimeout(() => save(), 5000);
		}
	};

	const save = async () => {
		const toSave = wfhDays.filter((x) => x.hasChanged);
		const response = await fetch('/api', {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(toSave)
		});
		const result = await response.json();
		//console.log("Save completed");
		//console.log(result);
		scheduleCount--;
		timestamp = null;
	};

	const calcHours = (arr) => {
		return (
			arr.filter((x) => x.status === undefined || x.status == 1).length * hoursPerDay
		).toFixed(1);
	};

	const getClass = (d, m, y, arr) => {
		const index = arr.findIndex((x) => x.day == d && x.month == m && x.year == y);
		//console.log(index);
		if (index >= 0) {
			//console.log("index greater than one");
			const row = arr[index];
			//console.log(row);
			if (row.status === undefined || row.status == 1) {
				//console.log("class is home");
				return 'home';
			}
		}
		const weekday = dayName(d, m, y);
		if (weekday === 'Sun' || weekday === 'Sat') return 'weekend';
		if (weekday === '---') return 'none';

		return 'office';
	};
	console.log($page.data.session);
</script>

<div>
	<div>
		<nav class="tui-nav fixed">
			<ul>
				<li class="tui-dropdown">
					<span class="red-168-text">F</span>ile
					<div class="tui-dropdown-content">
						<ul>
							<li>
								<a class="tui-modal-button" data-modal="modal" href="#!"
									><span data-modal="modal" class="tui-modal-button red-168-text">S</span>ettings</a
								>
							</li>
						</ul>
					</div>
				</li>
				<li>
					<div class="center">Total hours WFH: {calcHours(wfhDays)}</div>
				</li>
				<li class="right">User: {$page.data.session.user.name}</li>
			</ul>
		</nav>
	</div>
	<div class="center">
		<div class="tui-window" style="margin-top: 40px;">
			<fieldset class="tui-fieldset">
				<legend class="center">{fyear}/{fyear + 1 - 2000}</legend>
				<table>
					<thead>
						<td>Day</td>
						{#each months as month}
							<td>{month.name}</td>
						{/each}
					</thead>
					<tbody>
						{#each days as d}
							<tr>
								<td>{d}</td>
								{#each months as month}
									<td
										class={getClass(d, month.index, month.year, wfhDays)}
										on:click={(x) => handleClick(month, d)}
										>{dayName(d, month.index, month.year)}</td
									>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</fieldset>
		</div>
	</div>

	<!-- Overlap -->
	<div class="tui-overlap" />

	<!-- Modal window -->
	<div id="modal" class="tui-modal">
		<div class="tui-window red-168">
			<fieldset class="tui-fieldset">
				<legend class="red-255 yellow-255-text">Settings</legend>
				<label for="hours">Standard work day (hours)</label>
				<input class="tui-input" type="number" min="0" max="24" bind:value={hoursPerDay} />
				<button class="tui-button tui-modal-close-button right" data-modal="modal">close</button>
			</fieldset>
		</div>
	</div>
</div>

<style>
	table,
	td {
		border: 1px solid black;
		border-collapse: collapse;
	}
	.office {
		background-color: blue;
	}
	.home {
		background-color: green;
	}
	.none {
		background-color: white;
	}
	.weekend {
		background-color: #a8a8a8;
		color: black;
	}
	td {
		width: 100px;
	}
</style>
