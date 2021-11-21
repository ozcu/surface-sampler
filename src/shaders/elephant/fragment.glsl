 uniform float uTime;
 varying vec2 vUv;
 varying vec3 vPosition;

 void main()
    {
        
       gl_FragColor = vec4(vPosition, 1.0);

    }