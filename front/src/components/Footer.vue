<template>
    <footer>
      <div>
        Интернет-страничка разработана на мощностях производственного объединения «Кибернетические силы». 2020 г.
      </div>
    </footer>
</template>

<script>
export default {
name: "Footer"
}
</script>

<style scoped lang="scss">
  footer{
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 42px;
    font-family: Montserrat, serif;
    letter-spacing: 0.045em;
    font-size: 14px;
    text-align: center;
    background: #414141;
    color: white;
    @media screen and (max-width:420px) {
      padding: 10px;
      font-size: 12px;
    }

  }

</style>