<script>
// @ts-nocheck
import { page } from '$app/stores'
import { onMount } from "svelte";

    let fyear = 2023;
    let months = [
        {name:"Jul", index:7, year:fyear},
        {name:"Aug", index:8, year:fyear},
        {name:"Sep", index:9, year:fyear},
        {name:"Oct", index:10, year:fyear},
        {name:"Nov", index:11, year:fyear},
        {name:"Dec", index:12, year:fyear},
        {name:"Jan", index:1, year:fyear+1},
        {name:"Feb", index:2, year:fyear+1},
        {name:"Mar", index:3, year:fyear+1},
        {name:"Apr", index:4, year:fyear+1},
        {name:"May", index:5, year:fyear+1},
        {name:"Jun", index:6, year:fyear+1}]
    let days =  [...Array(31).keys()].map(x => x+1);

    let wfhDays = [];

    onMount(async () =>  {
        // const response = await fetch(`/api?fyear=${fyear}`);
        // const result = await response.json();
        // console.log(result);
        // wfhDays = result;
        await loadData();
    });

    const loadData = async () => {
        // const response = await fetch(`/api?fyear=${fyear}`);
        // const result = await response.json();
        // console.log(result);
        // wfhDays = result;

        wfhDays = [];
    }

    const dayName = (d, m, y) => {
        const name = ["sun","mon","tue","wed","thu","fri","sat"]
        const date = new Date(y,m-1,d);
        if (date.getMonth() != m-1) return "---";
        return name[date.getDay()];
    }

    const handleClick2 = (mon, day) => {
        const i = wfhDays.findIndex(x => x.day == day && x.month == mon.index && x.year == mon.year);
        if (i>=0) {
            wfhDays.splice(i,1);
            wfhDays = [...wfhDays];
        } else {
            wfhDays = [...wfhDays,{ day: day, month: mon.index, year: mon.year}]
        }
    }

    const handleClick = async (mon, day) =>  {
        const response = await fetch("/api", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ day: day, month: mon.index, year: mon.year, fyear: fyear}),
        });
        const result = await response.json();
        console.log(result);
        wfhDays = result;
    }

    const getClass = (d,m,y) => {
        const weekday = dayName(d,m,y);
        if (weekday === "sun" || weekday === "sat")
            return "weekend";
        if (weekday === "---")
            return "none";

        return "office";
    }
    console.log($page.data.session);
</script>
<div class="container">
    <nav class="navbar sticky-top bg-secondary">
        <div class="container-fluid">
            <p class="navbar-brand">WFH Calendar for financial year {fyear}/{(fyear+1)-2000}</p>
            <p class="navbar-text">Total hours WFH: {(wfhDays.length * 7.6).toFixed(1)}</p>
            <p class="navbar-text">User: {$page.data.session.user.name}</p>
            <form class="d-flex" role="search">

            <input on:change={loadData} bind:value={fyear} class="form-control me-2" type="number" placeholder="Financial year" aria-label="Financial year">
            </form>


        </div>
    </nav>
   <div class="pt-3">
    <table>
        <thead>
            <td>Day</td>
            {#each months as month }
            <td>{month.name}</td>
            {/each}  
        </thead>
        <tbody>
            {#each days as d}
            <tr>
                <td>{d}</td>
                {#each months as month }
                <td class="{(wfhDays.findIndex(x => x.day == d && x.month == month.index && x.year == month.year) >= 0) ? "home" : getClass(d,month.index,month.year)}" on:click={(x) => handleClick2(month, d)}>{dayName(d,month.index,month.year)}</td>
                {/each} 
            </tr>
            {/each}     
        </tbody>
    </table>
</div>
</div>


<style>
table, td {
  border: 1px solid black;
  border-collapse: collapse;
}
.office {
    background-color:lightblue
}
.home {
    background-color: green;
}
.none {
    background-color: white;
}
.weekend {
    background-color:dimgray
}
td {width: 100px;}
</style>
