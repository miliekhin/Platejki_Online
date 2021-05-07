<template>
  <div v-if="loading_process" class="wrp">
    <h2 class="text-center grey--text mt-10">ЗАГРУЗКА ДАННЫХ</h2>
<!--    <div class="lds-hourglass"></div>-->
    <loada class="mt-4"/>
  </div>
  <div v-else>
        <!--      <v-navigation-drawer app>-->
<!--        &lt;!&ndash; &ndash;&gt;-->
<!--      </v-navigation-drawer>-->

<!--      :value="!printMode" свитчит показ панели-->
      <v-app-bar app dense
                 :hide-on-scroll="!printMode"
                 class="d-print-none"
                 :value="!printMode"
      >
        <v-toolbar dense flat color="transparent" max-width="900" class="mx-auto">
          <v-toolbar-items>
            <v-btn icon :to="{name: 'Home'}" exact title="Перейти на домашнюю страницу">
              <v-icon>mdi-home-outline</v-icon>
            </v-btn>

          </v-toolbar-items>

          <v-toolbar-title >Мой кабинет</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn text :to="{name: 'Platejki'}" exact>
              <v-icon left>mdi-table-large</v-icon>
              Платежки
            </v-btn>
            <v-btn text :to="{name: 'Statistics'}" exact>
              <v-icon left>mdi-table-of-contents</v-icon>
              Статистика
            </v-btn>
            <v-btn text :to="{name: 'Settings'}" exact>
              <v-icon left>mdi-hammer-wrench</v-icon>
              Настройки
            </v-btn>
            <v-btn text :to="{name: 'HomeLogout'}" exact>
              <v-icon left>mdi-export</v-icon>
              Выйти
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </v-app-bar>

      <!-- Sizes your content based upon application components -->
      <v-main>
        <!-- Provides the application the proper gutter -->
        <v-container fluid :class="printMode ? 'pa-0' : ''">
          <v-sheet width="880" class="mx-auto">
          <!-- If using vue-router -->
            <router-view/>
          </v-sheet>
        </v-container>

      </v-main>
  </div>
</template>

<script>
import {mapActions} from 'vuex'
import Loada from "../components/Loada";
export default {
name: "Kabinet",
  components: {Loada},
  data:()=>({
    loading_process: true,
  }),
  computed:{
    printMode(){
      return this.$store.getters.getPrintMode
    }
  },
  methods:{
    ...mapActions(['act_fetchState', ]),
  },
  async created() {
    await this.act_fetchState()
    this.loading_process = false
  },
}
</script>

<style scoped>
  .wrp{
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /*.lds-hourglass {*/
  /*  display: inline-block;*/
  /*  position: relative;*/
  /*  width: 80px;*/
  /*  height: 80px;*/
  /*}*/
  /*.lds-hourglass:after {*/
  /*  content: " ";*/
  /*  display: block;*/
  /*  border-radius: 50%;*/
  /*  width: 0;*/
  /*  height: 0;*/
  /*  margin: 8px;*/
  /*  box-sizing: border-box;*/
  /*  border: 32px solid #fff;*/
  /*  border-color: #ccc transparent #ccc transparent;*/
  /*  animation: lds-hourglass 1.2s infinite;*/
  /*}*/
  /*@keyframes lds-hourglass {*/
  /*  0% {*/
  /*    transform: rotate(0);*/
  /*    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);*/
  /*  }*/
  /*  50% {*/
  /*    transform: rotate(900deg);*/
  /*    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);*/
  /*  }*/
  /*  100% {*/
  /*    transform: rotate(1800deg);*/
  /*  }*/
  /*}*/
</style>