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

<div class="container">
	<div class="pb-5">
		<nav class="navbar fixed-top bg-secondary">
			<div class="container-fluid">
				<p class="navbar-brand">
					WFH Calendar for financial year: {fyear}/{fyear + 1 - 2000}
				</p>
				<p class="navbar-text">Total hours WFH: {calcHours(wfhDays)}</p>
				<p class="navbar-text">User: {$page.data.session.user.name}</p>
				<div class="d-flex">
					<input
						on:change={fyearChange}
						bind:value={fyear}
						class="form-control me-2"
						type="number"
						placeholder="Financial year"
						aria-label="Financial year"
					/>
					<a href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">
						<img width="32" height="32" src="cog-setting.png" alt="Settings" />
					</a>
				</div>
			</div>
		</nav>
	</div>
	<div class="container pt-5">
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
								on:click={(x) => handleClick(month, d)}>{dayName(d, month.index, month.year)}</td
							>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Modal -->
	<div
		class="modal fade"
		id="exampleModal"
		tabindex="-1"
		aria-labelledby="exampleModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="exampleModalLabel">Settings</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
				</div>
				<div class="modal-body">
					<form>
						<label for="hours" class="form-label">Standard work day (hours)</label>
						<input
							class="form-control me-2"
							type="number"
							min="0"
							max="24"
							bind:value={hoursPerDay}
						/>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
					<!-- <button type="button" class="btn btn-primary">Save changes</button> -->
				</div>
			</div>
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
		background-color: lightblue;
	}
	.home {
		background-color: lightgreen;
	}
	.none {
		background-color: white;
	}
	.weekend {
		background-color: lightgray;
	}
	td {
		width: 100px;
	}
</style>
