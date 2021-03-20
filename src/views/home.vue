<template>
    <div class="container" ref="container">
        <canvas class="model-canvas" ref="canvas" v-on:mousemove="mousemoveFunc"></canvas>
        <div class="control">
            <el-button type="primary" v-on:click="randomOperation">随机打乱</el-button>
            <!-- <button v-on:click="rotateU(false)">U</button>
            <button v-on:click="rotateE(false)">E</button>
            <button v-on:click="rotateD(false)">D</button>
            <button v-on:click="rotateF(false)">F</button>
            <button v-on:click="rotateS(false)">S</button>
            <button v-on:click="rotateB(false)">B</button>
            <button v-on:click="rotateL(false)">L</button>
            <button v-on:click="rotateM(false)">M</button>
            <button v-on:click="rotateR(false)">R</button><br/>
            <button v-on:click="rotateU(true)">U'</button>
            <button v-on:click="rotateE(true)">E'</button>
            <button v-on:click="rotateD(true)">D'</button>
            <button v-on:click="rotateF(true)">F'</button>
            <button v-on:click="rotateS(true)">S'</button>
            <button v-on:click="rotateB(true)">B'</button>
            <button v-on:click="rotateL(true)">L'</button>
            <button v-on:click="rotateM(true)">M'</button>
            <button v-on:click="rotateR(true)">R'</button> -->
        </div>
    </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats-js'
export default {
    data: function () {
        return {
            // 渲染器
            render: null,
            // 场景
            scene: null,
            // 相机
            camera: null,
            // 滑轨控制器
            controls: null,
            // 光源
            light: null,
            // stats
            stats: null,
            cubePlanes: [],
            cubeSize: 8,
            // moveFinish: true,
            moveGroup: null,
            targetAngle: 0,
            currentAngle: 0,
            angleSpeed: 1,
            rotateDirection: '',
            dragData: {
                // 0 什么都不做，1 移动相机，2 旋转魔方
                state: 0,
                prevX: 0,
                prevY: 0,
                prevZ: 0
            },
            operationList: []
        }
    },
    methods: {
        randomOperation: function () {
            this.operationList = []
            const funcList = [this.rotateU, this.rotateE, this.rotateD, this.rotateF, this.rotateS, this.rotateB, this.rotateL, this.rotateM, this.rotateR]
            for (let i = 0; i < 10; i++) {
                const index = Math.floor(Math.random() * funcList.length)
                const reverse = Math.random() < 0.5
                this.operationList.push(() => {
                    funcList[index](reverse)
                })
            }
        },
        mousedownFunc: function (event) {
            let vector = new THREE.Vector3(event.offsetX / this.$refs.canvas.offsetWidth * 2 - 1, -(event.offsetY / this.$refs.canvas.offsetHeight) * 2 + 1, 0.5)
            vector = vector.unproject(this.camera)
            const raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize())
            const intersects = raycaster.intersectObjects(this.cubePlanes)
            if (intersects.length) {
                this.controls.enabled = false
                this.dragData.state = 2
                this.dragData.prevX = intersects[0].point.x
                this.dragData.prevY = intersects[0].point.y
                this.dragData.prevZ = intersects[0].point.z
            } else {
                this.controls.enabled = true
                this.dragData.state = 1
            }
        },
        mousemoveFunc: function () {
            // 计算方块旋转
            if (this.dragData.state === 2) {
                let vector = new THREE.Vector3(event.offsetX / this.$refs.canvas.offsetWidth * 2 - 1, -(event.offsetY / this.$refs.canvas.offsetHeight) * 2 + 1, 0.5)
                vector = vector.unproject(this.camera)
                const raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize())
                const intersects = raycaster.intersectObjects(this.cubePlanes)
                if (intersects.length && !this.moveGroup) {
                    const tempX = Math.abs(this.dragData.prevX - intersects[0].point.x)
                    const tempY = Math.abs(this.dragData.prevY - intersects[0].point.y)
                    const tempZ = Math.abs(this.dragData.prevZ - intersects[0].point.z)
                    if (Math.max(tempX, tempY, tempZ) < this.cubeSize / 8) {
                        return false
                    }
                    // 在右侧平面操作
                    if (this.dragData.prevX === intersects[0].point.x && intersects[0].point.x > 0) {
                        if (Math.abs(this.dragData.prevY - intersects[0].point.y) > Math.abs(this.dragData.prevZ - intersects[0].point.z)) {
                            // console.log('z轴转动')
                            if (intersects[0].point.z > this.cubeSize / 2) {
                                this.rotateF(this.dragData.prevY < intersects[0].point.y)
                            } else if (intersects[0].point.z < this.cubeSize / -2) {
                                this.rotateB(this.dragData.prevY > intersects[0].point.y)
                            } else {
                                this.rotateS(this.dragData.prevY < intersects[0].point.y)
                            }
                        } else {
                            // console.log('y轴转动')
                            if (intersects[0].point.y > this.cubeSize / 2) {
                                this.rotateU(this.dragData.prevZ > intersects[0].point.z)
                            } else if (intersects[0].point.y < this.cubeSize / -2) {
                                this.rotateD(this.dragData.prevZ < intersects[0].point.z)
                            } else {
                                this.rotateE(this.dragData.prevZ < intersects[0].point.z)
                            }
                        }
                    } else if (this.dragData.prevY === intersects[0].point.y && intersects[0].point.y > 0) {
                        // 在顶面操作
                        if (Math.abs(this.dragData.prevX - intersects[0].point.x) > Math.abs(this.dragData.prevZ - intersects[0].point.z)) {
                            // console.log('z轴转动')
                            if (intersects[0].point.z > this.cubeSize / 2) {
                                this.rotateF(this.dragData.prevX > intersects[0].point.x)
                            } else if (intersects[0].point.z < this.cubeSize / -2) {
                                this.rotateB(this.dragData.prevX < intersects[0].point.x)
                            } else {
                                this.rotateS(this.dragData.prevX > intersects[0].point.x)
                            }
                        } else {
                            // console.log('x轴转动')
                            if (intersects[0].point.x > this.cubeSize / 2) {
                                this.rotateR(this.dragData.prevZ < intersects[0].point.z)
                            } else if (intersects[0].point.x < this.cubeSize / -2) {
                                this.rotateL(this.dragData.prevZ > intersects[0].point.z)
                            } else {
                                this.rotateM(this.dragData.prevZ > intersects[0].point.z)
                            }
                        }
                    } else if (this.dragData.prevZ === intersects[0].point.z && intersects[0].point.z > 0) {
                        // 在前面操作
                        if (Math.abs(this.dragData.prevX - intersects[0].point.x) > Math.abs(this.dragData.prevY - intersects[0].point.y)) {
                            // console.log('y轴转动')
                            if (intersects[0].point.y > this.cubeSize / 2) {
                                this.rotateU(this.dragData.prevX < intersects[0].point.x)
                            } else if (intersects[0].point.y < this.cubeSize / -2) {
                                this.rotateD(this.dragData.prevX > intersects[0].point.x)
                            } else {
                                this.rotateE(this.dragData.prevX > intersects[0].point.x)
                            }
                        } else {
                            // console.log('x轴转动')
                            if (intersects[0].point.x > this.cubeSize / 2) {
                                this.rotateR(this.dragData.prevY > intersects[0].point.y)
                            } else if (intersects[0].point.x < this.cubeSize / -2) {
                                this.rotateL(this.dragData.prevY < intersects[0].point.y)
                            } else {
                                this.rotateM(this.dragData.prevY < intersects[0].point.y)
                            }
                        }
                    } else if (this.dragData.prevX === intersects[0].point.x && intersects[0].point.x < 0) {
                        // 在左侧操作
                        if (Math.abs(this.dragData.prevY - intersects[0].point.y) > Math.abs(this.dragData.prevZ - intersects[0].point.z)) {
                            // console.log('z轴转动')
                            if (intersects[0].point.z > this.cubeSize / 2) {
                                this.rotateF(this.dragData.prevY > intersects[0].point.y)
                            } else if (intersects[0].point.z < this.cubeSize / -2) {
                                this.rotateB(this.dragData.prevY < intersects[0].point.y)
                            } else {
                                this.rotateS(this.dragData.prevY > intersects[0].point.y)
                            }
                        } else {
                            // console.log('y轴转动')
                            if (intersects[0].point.y > this.cubeSize / 2) {
                                this.rotateU(this.dragData.prevZ < intersects[0].point.z)
                            } else if (intersects[0].point.y < this.cubeSize / -2) {
                                this.rotateD(this.dragData.prevZ > intersects[0].point.z)
                            } else {
                                this.rotateE(this.dragData.prevZ > intersects[0].point.z)
                            }
                        }
                    } else if (this.dragData.prevY === intersects[0].point.y && intersects[0].point.y < 0) {
                        // 在底面操作
                        if (Math.abs(this.dragData.prevX - intersects[0].point.x) > Math.abs(this.dragData.prevZ - intersects[0].point.z)) {
                            // console.log('z轴转动')
                            if (intersects[0].point.z > this.cubeSize / 2) {
                                this.rotateF(this.dragData.prevX < intersects[0].point.x)
                            } else if (intersects[0].point.z < this.cubeSize / -2) {
                                this.rotateB(this.dragData.prevX > intersects[0].point.x)
                            } else {
                                this.rotateS(this.dragData.prevX < intersects[0].point.x)
                            }
                        } else {
                            // console.log('x轴转动')
                            if (intersects[0].point.x > this.cubeSize / 2) {
                                this.rotateR(this.dragData.prevZ > intersects[0].point.z)
                            } else if (intersects[0].point.x < this.cubeSize / -2) {
                                this.rotateL(this.dragData.prevZ < intersects[0].point.z)
                            } else {
                                this.rotateM(this.dragData.prevZ < intersects[0].point.z)
                            }
                        }
                    } else if (this.dragData.prevZ === intersects[0].point.z && intersects[0].point.z < 0) {
                        // 在后面操作
                        if (Math.abs(this.dragData.prevX - intersects[0].point.x) > Math.abs(this.dragData.prevY - intersects[0].point.y)) {
                            // console.log('y轴转动')
                            if (intersects[0].point.y > this.cubeSize / 2) {
                                this.rotateU(this.dragData.prevX > intersects[0].point.x)
                            } else if (intersects[0].point.y < this.cubeSize / -2) {
                                this.rotateD(this.dragData.prevX < intersects[0].point.x)
                            } else {
                                this.rotateE(this.dragData.prevX < intersects[0].point.x)
                            }
                        } else {
                            // console.log('x轴转动')
                            if (intersects[0].point.x > this.cubeSize / 2) {
                                this.rotateR(this.dragData.prevY < intersects[0].point.y)
                            } else if (intersects[0].point.x < this.cubeSize / -2) {
                                this.rotateL(this.dragData.prevY > intersects[0].point.y)
                            } else {
                                this.rotateM(this.dragData.prevY > intersects[0].point.y)
                            }
                        }
                    }
                }
            }
        },
        mouseupFunc: function () {
            this.dragData.state = 0
            this.controls.enabled = true
        },
        // 创建渲染器
        createRenderer: function () {
            const renderer = new THREE.WebGLRenderer({
                canvas: this.$refs.canvas
            })
            // renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0)
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.shadowMap.enabled = true
            this.renderer = renderer
        },
        // 创建场景
        createScene: function () {
            this.scene = new THREE.Scene()
        },
        // 创建相机
        createCamera: function () {
            this.camera = new THREE.PerspectiveCamera(60, (window.innerWidth) / window.innerHeight, 0.1, 1000)
            this.camera.position.set(30, 30, 30)
            this.camera.lookAt(this.scene.position)
            // 生成视角控制器会影响鼠标事件
            this.controls = new OrbitControls(this.camera, this.$refs.canvas)
            this.controls.enabled = false
            this.scene.add(this.camera)
        },
        setAnimation: function () {
            window.modelAnimation = window.requestAnimationFrame(this.setAnimation)
            this.renderer.render(this.scene, this.camera)
            if (this.moveGroup && this.currentAngle !== this.targetAngle) {
                if (this.currentAngle > this.targetAngle) {
                    this.currentAngle = this.currentAngle - this.angleSpeed < this.targetAngle ? this.targetAngle : this.currentAngle - this.angleSpeed
                }
                if (this.currentAngle < this.targetAngle) {
                    this.currentAngle = this.currentAngle + this.angleSpeed > this.targetAngle ? this.targetAngle : this.currentAngle + this.angleSpeed
                }
                this.moveGroup.rotation[this.rotateDirection] = this.currentAngle / 180 * Math.PI
            }
            if (this.currentAngle === this.targetAngle && this.moveGroup) {
                this.scene.remove(this.moveGroup)
                const children = [...this.moveGroup.children]
                children.forEach(mesh => {
                    if (this.rotateDirection === 'y') {
                        if (mesh.position.y < 3 / 2 * this.cubeSize && mesh.position.y > -3 / 2 * this.cubeSize) {
                            mesh.rotation.y = mesh.rotation.y + this.currentAngle / 180 * Math.PI
                        }
                        const originX = mesh.position.x
                        const originZ = mesh.position.z
                        if (this.currentAngle < 0) {
                            mesh.position.x = -originZ
                            mesh.position.z = originX
                        } else if (this.currentAngle > 0) {
                            mesh.position.x = originZ
                            mesh.position.z = -originX
                        }
                    } else if (this.rotateDirection === 'x') {
                        if (mesh.position.x < 3 / 2 * this.cubeSize && mesh.position.x > -3 / 2 * this.cubeSize) {
                            mesh.rotation.x = mesh.rotation.x + this.currentAngle / 180 * Math.PI
                        }
                        const originY = mesh.position.y
                        const originZ = mesh.position.z
                        if (this.currentAngle < 0) {
                            mesh.position.y = originZ
                            mesh.position.z = -originY
                        } else if (this.currentAngle > 0) {
                            mesh.position.y = -originZ
                            mesh.position.z = originY
                        }
                    } else if (this.rotateDirection === 'z') {
                        if (mesh.position.z < 3 / 2 * this.cubeSize && mesh.position.z > -3 / 2 * this.cubeSize) {
                            if (mesh.rotation.x !== 0) {
                                mesh.rotation.y = mesh.rotation.y + this.currentAngle / 180 * Math.PI
                                mesh.rotation.x = mesh.rotation.x + this.currentAngle / 180 * Math.PI
                            } else if (mesh.rotation.y !== 0) {
                                mesh.rotation.y = mesh.rotation.y + this.currentAngle / 180 * Math.PI
                                mesh.rotation.x = mesh.rotation.x + this.currentAngle / 180 * Math.PI
                            }
                        }
                        const originX = mesh.position.x
                        const originY = mesh.position.y
                        if (this.currentAngle < 0) {
                            mesh.position.x = originY
                            mesh.position.y = -originX
                        } else if (this.currentAngle > 0) {
                            mesh.position.x = -originY
                            mesh.position.y = originX
                        }
                    }
                    this.scene.add(mesh)
                })
                this.moveGroup = null
            }
            this.stats.update()
            if (this.operationList.length && !this.moveGroup) {
                const fn = this.operationList.shift()
                fn()
            }
        },
        // 生成模型
        createModel: function () {
            // this.createAxisHelper()
            this.createCubePlanes()
        },
        // 创建坐标系
        createAxisHelper: function () {
            const axis = new THREE.AxesHelper(20)
            this.scene.add(axis)
        },
        // 创建底面平面
        createPlane: function () {
            const planeGeometry = new THREE.PlaneGeometry(60, 20)
            const material = new THREE.MeshLambertMaterial({
                color: 0xffffff
            })
            const plane = new THREE.Mesh(planeGeometry, material)
            plane.rotation.x = -0.5 * Math.PI
            plane.position.x = 15
            plane.position.y = 0
            plane.position.z = 0
            plane.receiveShadow = true
            this.scene.add(plane)
        },
        createTexture: function (color) {
            const canvas = document.createElement('canvas')
            canvas.width = 64
            canvas.height = 64
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = color
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(canvas.width, 0)
            ctx.lineTo(canvas.width, canvas.height)
            ctx.lineTo(0, canvas.height)
            ctx.closePath()
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 4
            ctx.stroke()
            return new THREE.CanvasTexture(canvas)
        },
        createCubePlanes: function () {
            this.cubePlanes = []
            // 创建顶面
            let planeMaterial = new THREE.MeshBasicMaterial({
                map: this.createTexture('rgb(255, 240, 0)'),
                side: THREE.DoubleSide
            })
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const planeGeometry = new THREE.PlaneGeometry(this.cubeSize, this.cubeSize)
                    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
                    planeMesh.rotation.x = Math.PI / -2
                    planeMesh.position.x = i * this.cubeSize
                    planeMesh.position.y = 3 / 2 * this.cubeSize
                    planeMesh.position.z = j * this.cubeSize
                    this.cubePlanes.push(planeMesh)
                    this.scene.add(planeMesh)
                }
            }
            // 创建底面
            planeMaterial = new THREE.MeshBasicMaterial({
                map: this.createTexture('rgb(240, 240, 240)'),
                side: THREE.DoubleSide
            })
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const planeGeometry = new THREE.PlaneGeometry(this.cubeSize, this.cubeSize)
                    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
                    planeMesh.rotation.x = Math.PI / -2
                    planeMesh.position.x = i * this.cubeSize
                    planeMesh.position.y = -3 / 2 * this.cubeSize
                    planeMesh.position.z = j * this.cubeSize
                    this.cubePlanes.push(planeMesh)
                    this.scene.add(planeMesh)
                }
            }
            // 创建前面
            planeMaterial = new THREE.MeshBasicMaterial({
                map: this.createTexture('rgb(230, 33, 41)'),
                side: THREE.DoubleSide
            })
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const planeGeometry = new THREE.PlaneGeometry(this.cubeSize, this.cubeSize)
                    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
                    planeMesh.position.x = j * this.cubeSize
                    planeMesh.position.y = i * this.cubeSize
                    planeMesh.position.z = 3 / 2 * this.cubeSize
                    this.cubePlanes.push(planeMesh)
                    this.scene.add(planeMesh)
                }
            }
            // 创建后面
            planeMaterial = new THREE.MeshBasicMaterial({
                map: this.createTexture('rgb(240, 133, 25)'),
                side: THREE.DoubleSide
            })
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const planeGeometry = new THREE.PlaneGeometry(this.cubeSize, this.cubeSize)
                    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
                    planeMesh.position.y = i * this.cubeSize
                    planeMesh.position.x = j * this.cubeSize
                    planeMesh.position.z = -3 / 2 * this.cubeSize
                    this.cubePlanes.push(planeMesh)
                    this.scene.add(planeMesh)
                }
            }
            // 创建左侧
            planeMaterial = new THREE.MeshBasicMaterial({
                map: this.createTexture('rgb(0, 162, 233)'),
                side: THREE.DoubleSide
            })
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const planeGeometry = new THREE.PlaneGeometry(this.cubeSize, this.cubeSize)
                    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
                    planeMesh.rotation.y = Math.PI / -2
                    planeMesh.position.x = -3 / 2 * this.cubeSize
                    planeMesh.position.y = i * this.cubeSize
                    planeMesh.position.z = j * this.cubeSize
                    this.cubePlanes.push(planeMesh)
                    this.scene.add(planeMesh)
                }
            }
            // 创建右侧
            planeMaterial = new THREE.MeshBasicMaterial({
                map: this.createTexture('rgb(0, 155, 76)'),
                side: THREE.DoubleSide
            })
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const planeGeometry = new THREE.PlaneGeometry(this.cubeSize, this.cubeSize)
                    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
                    planeMesh.rotation.y = Math.PI / -2
                    planeMesh.position.x = 3 / 2 * this.cubeSize
                    planeMesh.position.y = i * this.cubeSize
                    planeMesh.position.z = j * this.cubeSize
                    this.cubePlanes.push(planeMesh)
                    this.scene.add(planeMesh)
                }
            }
        },
        // 生成光照
        createLight: function () {
            const spotLight = new THREE.SpotLight(0xffffff)
            spotLight.position.set(-40, 60, -10)
            spotLight.castShadow = true
            this.scene.add(spotLight)
            this.light = spotLight
        },
        // 性能监听器
        createStats: function () {
            const stats = new Stats()
            stats.setMode(0)
            stats.domElement.style.position = 'fixed'
            stats.domElement.style.top = 0
            stats.domElement.style.left = 0
            document.body.appendChild(stats.domElement)
            this.stats = stats
        },
        // 顶部旋转
        rotateU: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? 90 : -90
            this.rotateDirection = 'y'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.y >= this.cubeSize / 2)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        // 顶部旋转
        rotateD: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? -90 : 90
            this.rotateDirection = 'y'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.y <= -this.cubeSize / 2)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        rotateE: function (reverse) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? -90 : 90
            this.rotateDirection = 'y'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.y === 0)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        // 右侧旋转
        rotateR: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? 90 : -90
            this.rotateDirection = 'x'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.x >= this.cubeSize / 2)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        // 左侧旋转
        rotateL: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? -90 : 90
            this.rotateDirection = 'x'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.x <= -this.cubeSize / 2)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        rotateM: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? -90 : 90
            this.rotateDirection = 'x'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.x === 0)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        // 旋转前边
        rotateF: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? 90 : -90
            this.rotateDirection = 'z'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.z >= this.cubeSize / 2)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        // 旋转后边
        rotateB: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? -90 : 90
            this.rotateDirection = 'z'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.z <= -this.cubeSize / 2)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        },
        rotateS: function (reverse = false) {
            if (this.moveGroup) {
                return false
            }
            this.targetAngle = reverse ? 90 : -90
            this.rotateDirection = 'z'
            this.currentAngle = 0
            const cubePlanes = this.cubePlanes.filter(mesh => mesh.position.z === 0)
            this.moveGroup = new THREE.Object3D()
            cubePlanes.forEach(mesh => {
                this.moveGroup.add(mesh)
            })
            this.scene.add(this.moveGroup)
        }
    },
    mounted: function () {
        window.cancelAnimationFrame(window.modelAnimation)
        this.createRenderer()
        this.createScene()
        this.createCamera()
        this.createLight()
        this.createModel()
        this.createStats()
        this.setAnimation()
        window.addEventListener('pointerdown', this.mousedownFunc, true)
        window.addEventListener('pointerup', this.mouseupFunc, true)
    },
    beforeDestroy: function () {
        window.cancelAnimationFrame(window.modelAnimation)
        window.removeEventListener('pointerdown', this.mousedownFunc)
        window.removeEventListener('pointerup', this.mouseupFunc)
    }
}
</script>
<style lang="stylus" scoped>
.container {
    font-size: 0;
    .control {
        position: fixed;
        top: 0;
        right: 0;
    }
}
</style>
