<script>
// @ts-nocheck
import { page } from '$app/stores'
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

    const dayName = (d, m, y) => {
        const name = ["sun","mon","tue","wed","thu","fri","sat"]
        const date = new Date(y,m-1,d);
        if (date.getMonth() != m-1) return "---";
        return name[date.getDay()];
    }

    const handleClick = (mon, day) => {
        const i = wfhDays.findIndex(x => x.day == day && x.month == mon.index && x.year == mon.year);
        if (i>=0) {
            wfhDays.splice(i,1);
            wfhDays = [...wfhDays];
        } else {
            wfhDays = [...wfhDays,{ day: day, month: mon.index, year: mon.year}]
        }
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
<h1>WFH Calendar for financial year {fyear}/{(fyear+1)-2000}</h1>
<h2>Total hours WFH: {wfhDays.length * 7.6}</h2>
<table >
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
            <td class="{(wfhDays.findIndex(x => x.day == d && x.month == month.index && x.year == month.year) >= 0) ? "home" : getClass(d,month.index,month.year)}" on:click={(x) => handleClick(month, d)}>{dayName(d,month.index,month.year)}</td>
            {/each} 
        </tr>
        {/each}     
    </tbody>
</table>

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
