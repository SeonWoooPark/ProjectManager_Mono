import * as React from 'react'

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean
}

export function Img({ fill, style, ...rest }: ImgProps) {
  if (fill) {
    return (
      <img
        {...rest}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
        loading={rest.loading ?? 'lazy'}
      />
    )
  }
  return <img {...rest} loading={rest.loading ?? 'lazy'} />
}
