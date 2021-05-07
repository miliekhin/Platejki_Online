<template>
<div id="wrappa">
  <div v-for="(pl_date, i) in prop_dates" :key="pl_date">
    <platejka-print :prop_date="pl_date" :prop_is_last_plat="i === prop_dates.length-1"></platejka-print>
  </div>
</div>
</template>

<script>
// Как убрать колонтитулы https://stackoverflow.com/questions/8228088/remove-header-and-footer-from-window-print
// Их лучше не убирать т.к. они могут понадобится юзеру при распечатке большого количества платежек.
// Однако их можно убрать в настроках окна распечатки. О чем можно написать в чаво.
import PlatejkaPrint from "@/components/PlatejkaPrint";
export default {
  name: "Printer",
  components:{PlatejkaPrint},
  props:['prop_dates',  ],
  data: ()=>({
      services: [],
  }),
  methods:{
  },
  mounted() {
    // показ окна печати. Печать, распечатка
    window.print()
  },
}
</script>

<style scoped>
#wrappa{
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>