<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	const getCurrentYear = () => {
		const now = new Date();
		const year = now.getFullYear();
		return now > new Date(year, 6 - 1, 30) ? year : year - 1;
	};

	const getMonths = () => [
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

	let fyear = getCurrentYear();
	let months = getMonths();
	let days = [...Array(31).keys()].map((x) => x + 1);

	let wfhDays = [];
	let wfhDaysLy = [];
	let holidays = [];
	let timestamp = null;
	let scheduleCount = 0;
	let hoursPerDay = 7.6;
	let loading = false;

	onMount(async () => {
		loading = true;
		holidays = await loadHolidays(fyear);
		wfhDays = await loadData(fyear);
		wfhDaysLy = await loadData(fyear - 1);
		loading = false;
	});

	const fyearChange = async () => {
		loading = true;
		await save();
		holidays = await loadHolidays(fyear);
		months = getMonths();
		wfhDays = await loadData(fyear);
		loading = false;
	};

	const loadData = async (financialYear) => {
		const response = await fetch(`/api?fyear=${financialYear}`);
		const result = await response.json();
		//console.log(result);
		return result;
	};

	const loadHolidays = async (financialYear) => {
		const response = await fetch(`/api/holidays?fyear=${financialYear}`);
		const result = await response.json();

		console.log('holidays are', result);
		return result;
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
		console.log(holidays);
		if (holidays.find((x) => x.day == d && (x.month == m) & (x.year == y))) return 'cyan-168';

		return 'office';
	};
	console.log($page.data.session);
</script>

<div class="blue-168">
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
				<li>
					<div class="center">Last Year: {calcHours(wfhDaysLy)}</div>
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

	<!--Loading screen-->
	{#if loading}
		<div class="center">
			<div class="tui-modal active">
				<div class="tui-panel yellow-168 black-168-text">
					<div class="tui-panel-header">Loading</div>
					<div class="tui-panel-content">Loading data. Please wait...</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal window -->
	<div id="modal" class="tui-modal center">
		<div class="tui-window red-168">
			<fieldset class="tui-fieldset">
				<legend class="red-255 yellow-255-text">Settings</legend>
				<div class="row">
					<label for="hours">Standard work day (hours)</label>
					<input
						id="hours"
						class="tui-input"
						type="number"
						min="0"
						max="24"
						bind:value={hoursPerDay}
					/>
				</div>
				<div class="row">
					<label for="year">Financial Year (for this session)</label>
					<input
						id="year"
						class="tui-input"
						type="number"
						min="2020"
						max="2100"
						bind:value={fyear}
					/>
				</div>
				<div class="row">
					<button
						class="tui-button tui-modal-close-button right"
						data-modal="modal"
						on:click={(x) => fyearChange()}>close</button
					>
				</div>
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
		background-color: #00a800;
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
