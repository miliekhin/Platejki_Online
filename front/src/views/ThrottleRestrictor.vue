<template>
<div class="wrp">
  <h2 class="font-weight-light mb-8 red--text">
    Ой. Сервер временно недоступен.
  </h2>
  <p>
    Извините, но мы вынуждены временно ограничить доступ, так как с вашей стороны поступает очень много запросов.
  </p>
  <p>Вы можете попробовать использовать другой браузер или проверить свой компьютер на вирусы.</p>
  <p>
    Вы также можете написать нам об этой ошибке через <router-link title="Обратная связь" :to="{name: 'Home', hash: '#konnekta'}">форму обратной связи</router-link>.
  </p>
  <router-link title="Обратная связь" :to="{name: 'Home'}">Вернуться на главную</router-link>

</div>
</template>

<script>
export default {
name: "ThrottleRestrictor"
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
</style>