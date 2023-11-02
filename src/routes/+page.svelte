<script>
    let fyear = "2023/24";
    let months = [
        {name:"Jul", index:7, year:2023},
        {name:"Aug", index:8, year:2023},
        {name:"Sep", index:9, year:2023},
        {name:"Oct", index:10, year:2023},
        {name:"Nov", index:11, year:2023},
        {name:"Dec", index:12, year:2023},
        {name:"Jan", index:1, year:2024},
        {name:"Feb", index:2, year:2024},
        {name:"Mar", index:3, year:2024},
        {name:"Apr", index:4, year:2024},
        {name:"May", index:5, year:2024},
        {name:"Jun", index:6, year:2024}]
    let days =  [...Array(31).keys()].map(x => x+1);

    let wfhDays = [];


    const dayName = (d,m,y) => {
        const name = ["sun","mon","tue","wed","thu","fri","sat"]
        const date = new Date(y,m-1,d);
        if (date.getMonth() != m-1) return "---";
        return name[date.getDay()];
    }

    const handleClick = (mon, day) => {
        //wfhDays.push({ day: day, month: mon.index, year: mon.year});
        wfhDays = [...wfhDays,{ day: day, month: mon.index, year: mon.year}]
        console.log(mon);
        console.log(day);
        console.log("Clicked it!");
    }

    const getClass = (d,m,y) => {
        // const index = wfhDays.findIndex(x => x.day == d && x.month == m && x.year == y);
        // console.log("in getClass");
        // console.log(index);
        return (wfhDays.findIndex(x => x.day == d && x.month == m && x.year == y) > 0) ? "home" : "office";
    }
</script>
<h1>WFH Calendar for financial year {fyear}</h1>
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
            <td class="{(wfhDays.findIndex(x => x.day == d && x.month == month.index && x.year == month.year) > 0) ? "home" : "office"}" on:click={(x) => handleClick(month, d)}>{dayName(d,month.index,month.year)}</td>
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
    background-color: blue;
}
.home {
    background-color: green;
}
.none {
    background-color: white;
}
td {width: 100px;}
</style>
