<script>
    export let disabled = false
</script>

<button {disabled} on:click><slot></slot></button>

<style>
    button {
        width: 13mm;
        height: 13mm;
        border-radius: 50%;
        font-weight: 600;
        color: #F6F1D5;
        background-color: #3F00FF;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: none;
        transition: border-radius 0.125s ease;
        user-select: none;
    }
    button:hover {
        background-color: #5017FF;
        border-radius: 45%;
    }
    button:active {
        background-color: #602CFF;
        border-radius: 25%;
    }
    button:disabled {
        filter: brightness(0.75) saturate(0);
        pointer-events: none;
    }
    @media (prefers-color-scheme: dark) {
        button {
            color: #3F00FF;
            background-color: #F6F1D5;
        }
        button:hover { background-color: #E0DBC2; }
        button:active { background-color: #CCC7B0; }
        button:disabled { filter: brightness(0.5) saturate(0); }
    }
</style>