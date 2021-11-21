    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;
    void main()
    {
        vUv = uv;
        vPosition = position;

        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        gl_Position = projectionMatrix * viewMatrix * modelPosition ;
        gl_PointSize = 3.0;
    }