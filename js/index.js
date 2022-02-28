import { createApp } from "./vue.esm-browser.js";

const supabaseUrl = 'https://ifroqwtukgxvzedrtgkz.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmcm9xd3R1a2d4dnplZHJ0Z2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYwMzkzNjAsImV4cCI6MTk2MTYxNTM2MH0.ddcghgv2_UsRtAIAkchvSZu0NEnMk-ApK9jJK6KNGRo"
const cli = supabase.createClient(supabaseUrl, supabaseKey)

createApp({
    data() {
        return {
            mensajes: [],
            nombre: "",
            nuevoMensaje: "",
        }
    },
    methods: {
        async cargarMensajes() {
            let {data: data, error } = await cli
                .from("chat")
                .select("*")
                .order('created_at', { ascending: true })
            this.mensajes = data;
        },
        async enviarMensaje() {
            const { data, error } = await cli
                .from('chat')
                .insert([
                    { nombre: this.nombre, mensaje: this.nuevoMensaje },
                ])
            const vibrate = window.navigator.vibrate([200, 100, 200]);
            let notification = new Notification( this.nombre,
                {
                    body: this.nuevoMensaje,
                    vibrate: vibrate,
                }
            );
            console.log(notification);
            this.nombre = "";
            this.nuevoMensaje = "";
        },
        escucharNuevosMensajes() {
            cli
                .from('chat')
                .on('INSERT', payload => {
                    this.mensajes.push(payload.new)
                })
                .subscribe()
        },
    },
    mounted() {
        this.cargarMensajes();
        this.escucharNuevosMensajes();
        if (Notification.permission !== "granted") {
            let promise = Notification.requestPermission();
            console.log(promise);
        }
    },
    watch: {
        mensajes: {
            handler() {
                this.$nextTick(() => {
                    const elemento = this.$refs.mensajesContenedor;
                    elemento.scrollTo(0, elemento.scrollHeight);
                })
            },
            deep: true
        }
    },
}).mount("#app");