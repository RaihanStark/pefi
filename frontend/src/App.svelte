<script lang="ts">
  import logo from './assets/images/logo-universal.png'
  import {Greet} from '../wailsjs/go/main/App.js'

  let resultText: string = "Please enter your name below 👇"
  let name: string

  function greet(): void {
    Greet(name).then(result => resultText = result)
  }
</script>

<main>
  <img
    alt="Wails logo"
    src="{logo}"
    class="block w-1/2 h-1/2 mx-auto pt-[10%] bg-center bg-no-repeat bg-[length:100%_100%] bg-origin-content"
  >
  <div class="h-5 leading-5 my-6 mx-auto">{resultText}</div>
  <div class="flex items-center justify-center">
    <input
      autocomplete="off"
      bind:value={name}
      class="border-none rounded outline-none h-[30px] leading-[30px] px-2.5 bg-[rgba(240,240,240,1)] antialiased hover:bg-white focus:bg-white"
      type="text"
    />
    <button
      class="w-[60px] h-[30px] leading-[30px] rounded border-none ml-5 px-2 cursor-pointer hover:bg-gradient-to-t hover:from-[#cfd9df] hover:to-[#e2ebf0] hover:text-[#333]"
      on:click={greet}
    >Greet</button>
  </div>
</main>
