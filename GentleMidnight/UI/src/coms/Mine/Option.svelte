<script>
    export let value
</script>

<option value={value}><slot></slot></option>

<style>
    option {
        width: calc(70px - 1rem*2);
        height: calc(40px - 2.5mm*2);
        font-size: 125%;
        padding: 2.5mm 1rem;
        font-family: monospace;
        background-color: #3F00FF;
        color: #F6F1D5;
        display: flex;
        justify-content: center;
        cursor: pointer;
        border-bottom: 1px solid #F6F1D5;
    }
    option:last-of-type { border: none; }
    option:hover { background-color: #5017FF; }
    option:active { background-color: #602CFF; }
    option:checked { background-color: #602CFF; }
    @media (prefers-color-scheme: dark) {
        option {
            color: #3F00FF;
            background-color: #F6F1D5;
            border-bottom: 1px solid #3F00FF;
        }
        option:hover { background-color: #E0DBC2; }
        option:active { background-color: #CCC7B0; }
        option:checked { background-color: #CCC7B0; }
    }
</style>