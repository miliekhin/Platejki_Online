import {y_m_Obj} from '@/utils/utils'
import axios from "axios";

export default {
    state: {

    },

    mutations: {

    },

    actions: {
        async act_UpdatePlatRecvizits({dispatch}, in_obj) {
            let plat_id = in_obj.plat_id
            // console.log('act_UpdatePlatRecvizits in_obj:', in_obj)
            if (in_obj.payer)
                await dispatch('act_changePlatPayer', {plat_id, payer_name: in_obj.payer})
            if (in_obj.erc !== null)
                await dispatch('act_changePlatERC', {plat_id, erc: in_obj.erc})
            if (in_obj.pay_period !== null)
                await dispatch('act_changePlatPayPeriod', {plat_id, pay_period: in_obj.pay_period})

        },
        async act_changePlatPayer({commit, rootState}, in_obj){
            in_obj.owner = rootState.authModule.user.id
            commit('mut_setPlatNewPayer', in_obj)
            let resp = await axios.patch(rootState.pre_path + 'platejka/edit_payer/',  in_obj)
            console.log('act_changePlatPayer result:', resp)
            if (resp.status === 201)
                commit('mut_addNewPayer', resp.data)
        },
        async act_changePlatERC({commit, rootState}, in_obj){
            in_obj.owner = rootState.authModule.user.id
            commit('mut_setPlatNewERC', in_obj)
            let resp = await axios.patch(rootState.pre_path + 'platejka/edit_erc/',  in_obj)
            console.log('act_changePlatERC result:', resp)
            if (resp.status === 201)
                commit('mut_addNewERC', resp.data)
        },
        async act_changePlatPayPeriod({commit, rootState}, in_obj){
            in_obj.owner = rootState.authModule.user.id
            commit('mut_setPlatNewPayPeriod', in_obj)
            let resp = await axios.patch(rootState.pre_path + 'platejka/edit_pay_period/',  in_obj)
            console.log('act_changePlatPayPeriod result:', resp)
        },
        async act_addNewPlatejka({commit, getters, dispatch, rootState}, in_obj){
            let payer_id = getters.getPayerIdByName(in_obj.payer_name)
            if ( payer_id === -1 ) {  // Если такого плательщика нет
                await dispatch('act_addNewPayer', in_obj.payer_name)
                payer_id = getters.getPayerIdByName(in_obj.payer_name)
                console.log('New payer added:', payer_id)
            }
            let adr_id = getters.getAddrIdByName(in_obj.adr_name)
            if ( adr_id === -1 ) {
                await dispatch('addNewAdres', in_obj.adr_name)
                adr_id = getters.getAddrIdByName(in_obj.adr_name)
                console.log('New adres added:', adr_id)
            }
            let erc_id = -1
            if ( in_obj.erc.length ) {
                erc_id = getters.getErcIdByName(in_obj.erc)
                if ( erc_id === -1 ) {
                    await dispatch('act_addNewErc', in_obj.erc)
                    erc_id = getters.getErcIdByName(in_obj.erc)
                    console.log('New ERC added:', erc_id)
                }
            }

            let send_obj = {}
            send_obj.adr_id = adr_id
            send_obj.payer_id = payer_id
            send_obj.erc_id = erc_id
            // send_obj.owner = rootState.authModule.user.id
            send_obj.pdate = in_obj.pdate
            send_obj.pay_period = in_obj.pay_period
            let resp = await axios.post(rootState.pre_path + 'platejka/', send_obj)
            commit('mut_addNewPlatejka', resp.data)
        },

        async act_addNewErc({commit, rootState}, erc_name){
            let send_obj = {'name': erc_name.trim(), 'owner': rootState.authModule.user.id}
            let resp = await axios.post(rootState.pre_path + 'erc/', send_obj)
            commit('mut_addNewERC', resp.data)
        },
        async act_addNewPayer({commit, rootState}, payer_name){
            let send_obj = {'name': payer_name.trim(), 'owner': rootState.authModule.user.id}
            let resp = await axios.post(rootState.pre_path + 'payer/', send_obj)
            commit('mut_addNewPayer', resp.data)
        },
        async addNewAdres({commit, rootState}, addrs){
            let send_obj = {'name': addrs.trim(), 'owner': rootState.authModule.user.id}
            let resp = await axios.post(rootState.pre_path + 'adres/', send_obj)
            commit('addNewAdres', resp.data)
        },

        async act_firstPlatejkaCreated({commit, rootState}){
            let id = rootState.stateModule.appState.settings[0].id
            await axios.patch(rootState.pre_path + 'settings/' + id + '/', {first_platejka_created: true})
            commit('mut_firstPlatejkaCreated')
        },

        act_savePlatejka({commit, getters, rootState}, in_obj){
            let out_plat_obj = {
                plat_id: in_obj.plat_id,
                stroki: [],
            }

            let state_stroki = getters.getStrokiOfPlat(in_obj.plat_id)
            in_obj.stroki.forEach(edited_stroka => {
                let state_stroka = state_stroki.find(ststr => ststr.id === edited_stroka.id)
                let out_stroka = {}
                let new_val = ''
                for(let key in edited_stroka){
                    if (state_stroka[key] !== edited_stroka[key]){
                        out_stroka.id = state_stroka.id
                        // округление до двух знаков и отброс нулей после запятой, и запись числа в виде строки
                        if (key === 'schet'){
                            new_val = edited_stroka[key]
                        } else {
                            new_val = parseFloat(edited_stroka[key])
                            if (edited_stroka[key].length && !new_val)
                                new_val = edited_stroka[key]
                            else
                                new_val = +new_val.toFixed(key === 'pay_amount' ? 2 : 3)
                        }
                        out_stroka[key] = new_val
                        // console.log('new val:', out_stroka[key])
                    }
                }
                if (out_stroka.id)
                    out_plat_obj.stroki.push(out_stroka)
            })
            if (out_plat_obj.stroki.length) {
                commit('mut_savePlatejka', out_plat_obj)
                axios.patch(rootState.pre_path + 'platejka/edit_stroki/', out_plat_obj.stroki)
            }
        },
        async platejkaRemoved({commit, rootState}, plat_id){
            await axios.delete(rootState.pre_path + 'platejka/' + plat_id + '/')
            commit('platejkaRemoved', plat_id)
        },
        async act_copyPlat({commit, rootState}, curr_date_str){
            const resp = await axios.post(rootState.pre_path + 'platejka/copy_last_plat/', {
                month: curr_date_str.substr(5, 2)-1,
                year: curr_date_str.substr(0, 4)
            })
            commit('mut_copyPlat', resp.data)
        },
        async act_setPayedDate({commit, rootState}, in_obj){
            console.log('Sending payed date:', in_obj.payed_date)
            await axios.patch(rootState.pre_path + 'platejka/' + in_obj.plat_id + '/', {pay_date: in_obj.payed_date})
            commit('mut_setPayedDate', in_obj)
        },
        // addAddrsFromPlat({commit}, in_obj){
        //   commit('addAddrsFromPlat', in_obj)
        // },
        async act_sevicesEdited({commit, rootState}, trans_obj){
            trans_obj.owner = rootState.authModule.user.id
            let resp_obj = await axios.patch(rootState.pre_path + 'usluga/bulk_patch/', trans_obj)
            commit('mut_sevicesEdited', {trans_obj, resp_obj: resp_obj.data})
        }
    },

    getters: {
        getStrokaByID: (state, getters) => str_id =>{
            for(const plat of getters.platejkiAll){
                let str_obj = plat.stroka.find(str => str.id === str_id)
                if (str_obj)
                    return str_obj
            }
            return null
        },
        getPlatejkiByDate: (state, getters) => date_str => {
            let ym = y_m_Obj(date_str)
            return getters.platejkiAll.filter(pl => pl.pmonth === ym.m && pl.pyear === ym.y)
        },
        getPlatejkaByID: (state, getters) => plat_id => {
            return getters.platejkiAll.find(pl => pl.id === plat_id)
        },
        getUnusedPlatejkaServicesNames: (state, getters) => used_servss_arr => {
            return getters.getServices
                .filter(ss => !used_servss_arr.includes( ss.name )).map(s => s.name)
        },
        platejkiAll: (state, getters, rootState) => {
          return rootState.stateModule.appState.platejka
          // return rootState.plat_state.platejki_all
        },
        unusedAddresses: (state, getters) => curr_addr =>{
            let nms = getters.getAddresses.map(ad => ad.name).filter(adr => adr !== curr_addr)
            // let nms = rootState.plat_state.settings.addrss.map(ad => ad.name).filter(adr => adr !== curr_addr)
            //console.log(nms)
            return nms
        },
        getErcIdByName: (state, getters) => erc_name =>{
            erc_name = erc_name.toLocaleLowerCase()
            let erc = getters.getERC.find(erc => erc.name.toLocaleLowerCase() === erc_name);
            if (erc){
              return  erc.id
            }
            return -1
        },
        getAddrIdByName: (state, getters) => addr_name =>{
            addr_name = addr_name.toLocaleLowerCase()
            let addr = getters.getAddresses.find(addr => addr.name.toLocaleLowerCase() === addr_name);
            if (addr){
              return  addr.id
            }
            return -1
        },
        isAddrUsedAtDate: (state, getters) => in_obj =>{
            let ym = y_m_Obj(in_obj.pdate)
            let ret = getters.platejkiAll.find(pl => (pl.addr === in_obj.addrs && pl.pmonth === ym.m && pl.pyear === ym.y))
            // console.log('isAddrUsedAtDate:', in_obj, ret, ym)
            return ret
        },
        getPayerIdByName: (state, getters) => name => {
            name = name.toLowerCase()
            let p = getters.getPayers.find(p => p.name.toLowerCase() === name)
            if(p === undefined){
                return -1
            }
            return p.id
        },
        getServNameById: (state, getters) => serv_id =>{
            return getters.getServices.find(s => s.id === serv_id).name
        },
        // getSchetaByAddrName: (state, getters, rootState) => addr_name => {
        //     return rootState.plat_state.settings.scheta[getters.getAddrIndexByName(addr_name)].map(s => ({
        //         srv_name: getters.getServNameById(s.serv_id),
        //         srv_schet: s.schet
        //     }))
        // },
        // getSchetaServNamesByAddrName: (state, getters, rootState) => addr_name => {
        //     //console.log(addr_name)
        //     return rootState.plat_state.settings.scheta[getters.getAddrIndexByName(addr_name)].map(s => getters.getServNameById(s.serv_id))
        // },
        getAddrIndexByName: (state, getters) => addr_name => {
          return getters.getAddresses.findIndex(ad => ad.name === addr_name)
        },
        isFirstPlatejkaCreated: (state, getters, rootState) =>{
            return rootState.stateModule.appState.settings[0].first_platejka_created
          // return rootState.plat_state.settings.first_platejka_created
        },
        getPlatejkiForYear: (state, getters) => pyear =>{
            let mp_arr = []
            let last_month = (pyear === new Date().getFullYear() ? new Date().getMonth()+1 : 12)
            let mnths = [...Array(last_month).keys()].reverse()
            // console.log(last_month)
            mnths.forEach(m =>{
                let pl_arr = getters.platejkiAll.filter(p => p.pmonth === m && p.pyear === pyear).map(pl=>pl.id)
                if ( pl_arr.length ){
                    let mp_obj = {pmnth: m, pl_arr}
                    mp_arr.push(mp_obj)
                }
            })
            return mp_arr
        },
        getLatestYear: (state, getters) => {
            // return Math.max( ...rootState.plat_state.platejki_all.map(p => p.pyear) )
            return Math.max( ...getters.platejkiAll.map(p => p.pyear) )
        },
        getStrokiOfPlat: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl => pl.id === plid).stroka
        },
        getServiceNamesOfPlat: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl=>pl.id === plid).stroka.map(s => s.srvc_name)
        },
        getPayerName: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl=>pl.id === plid).payer
        },
        getAddrName: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl=>pl.id === plid).addr
        },
        getErcCode: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl=>pl.id === plid).erc
        },
        getPayPeriod: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl=>pl.id === plid).pay_period
        },
        getMaxPayPeriod: (state, getters) => plid =>{
            let pl = getters.platejkiAll.find(pl=>pl.id === plid)
            return `${pl.pyear}-${('0'+(pl.pmonth+1)).slice(-2)}`
        },
        getPlatPayedDate: (state, getters) => plid =>{
            return getters.platejkiAll.find(pl=>pl.id === plid).pay_date
        },
        getYears: (state, getters) => { // Сортировка чисел
            return [...new Set(getters.platejkiAll.map(p => p.pyear))].sort((a, b) => b - a)
        },
        getAddrNamesOfYearPlats: (state, getters) => year => {
            return [...new Set(getters.platejkiAll.filter(p => p.pyear === year).map(p => p.addr))]
        },
        getAllPlatDates: (state, getters) => {// ноль перед цифрой
            return [...new Set(getters.platejkiAll.map(p => p.pyear + '-' + ('0'+(p.pmonth+1)).slice(-2) ))]
        },
        getLatestPlatejki: (state, getters) => y_m_obj =>{
            let m = y_m_obj.m
            let y = y_m_obj.y
            if( !m ){
                m = 12
                y--
            }
            // console.log(m)
            let no_curr_plats_arr = getters.platejkiAll.filter(p => (p.pyear <= y && p.pmonth < m))
            // console.log(no_curr_plats_arr)
            let latest_y = [...new Set(no_curr_plats_arr.map(p => p.pyear))].sort((a, b) => b - a)
            latest_y = latest_y[0]
            // console.log(latest_y)
            let latest_m = no_curr_plats_arr.filter(p => p.pyear === latest_y)
            latest_m = [ ...new Set(latest_m.map(p => p.pmonth)) ].sort((a, b) => b - a)
            latest_m = latest_m[0]
            // console.log(latest_m)
            return no_curr_plats_arr.filter(p => (p.pyear === latest_y && p.pmonth === latest_m))
        },
        getPrevMonthPlatsCanBeAdded: (state, getters ) => curr_date_str =>{
            if( !getters.platejkiAll.length )
                return []
            let y_m = y_m_Obj(curr_date_str)
            // console.log(y_m)
            //y_m.m = y_m.m - 1
            //let prev_month_plats_arr = rootState.plat_state.platejki_all.filter(pl => (pl.pmonth === y_m.m && pl.pyear === y_m.y))
            let prev_month_plats_arr = getters.getLatestPlatejki(y_m)
            // console.log('Prev month plats:', prev_month_plats_arr)
            if( !prev_month_plats_arr.length ){
                //console.log(y_m)
                return []
            }
            //y_m.m = y_m.m + 1
            let curr_month_plats_arr = getters.platejkiAll.filter(pl => (pl.pmonth === y_m.m && pl.pyear === y_m.y))
            if( !curr_month_plats_arr.length )
                return prev_month_plats_arr
            let curr_month_addrsss = curr_month_plats_arr.map(pl => pl.addr)
            return prev_month_plats_arr.filter(pl => !curr_month_addrsss.includes(pl.addr))
        },
        getYearTotalAllAddresses:(state, getters) => in_year =>{
            const plats_arr = getters.platejkiAll.filter(pl => (pl.pyear === in_year ))
            let summ = 0
            plats_arr.forEach(pl => {
                pl.stroka.forEach(s => {
                    if( s.pay_amount )
                        summ += parseFloat(s.pay_amount) || 0
                })
            })
            return summ
        },
        getStatisticData: (state, getters) => in_obj =>{
            const plats_arr = getters.platejkiAll.filter(pl => (pl.pyear === in_obj.year && pl.addr === in_obj.addr_name))
            // console.log('platsarr count:', plats_arr.length, in_obj)
            // Создаем список всех услуг которые были в платежках за этот год по этому адресу
            let usl_set = new Set()
            plats_arr.forEach(pl => {
                pl.stroka.map(s => s.srvc_name).forEach(nm => usl_set.add(nm))
            })
            // console.log('usl_set:', usl_set)
            let uslugi_arr = [...usl_set]

            // Создаем пустой календарь
            let stat_calendar = []
            uslugi_arr.forEach(usl => {
                let arr = new Array(14).fill('-')
                arr[0] = usl
                stat_calendar.push(arr)
            })

            // Заполняем календарь данными
            plats_arr.forEach(pl => {
                pl.stroka.forEach(s => {
                    if( s.pay_amount )
                        stat_calendar.find(st => st[0] === s.srvc_name)[pl.pmonth+1] = s.pay_amount
                })
            })

            // Калькулируем результаты
            stat_calendar.forEach(cell_arr => {
                let summ = 0
                cell_arr.forEach(cell => {
                    summ += parseFloat(cell) || 0
                })
                cell_arr[cell_arr.length-1] = summ
            })

            // console.log('stat_calendar:', stat_calendar)
            return stat_calendar
        },
    },
}