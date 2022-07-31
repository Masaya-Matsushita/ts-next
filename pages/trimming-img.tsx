import { Button, Modal, Slider } from '@mantine/core'
import { NextPage } from 'next'
import { ChangeEvent, useCallback, useState } from 'react'
import Cropper, { Area, MediaSize } from 'react-easy-crop'
import { Plus } from 'tabler-icons-react'
import getCroppedImg from '../libs/func/getCroppedImg'

// 参考　https://zenn.dev/kyosuke_14/articles/e892bffc0357da
const TrimmingImg: NextPage = () => {
  const [opened, setOpened] = useState(false)
  const [imgSrc, setImgSrc] = useState('/sample.jpg')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
  const [croppedImgSrc, setCroppedImgSrc] = useState('')

  const ASPECT_RATIO = 1
  const CROP_WIDTH = 200

  // 画像ファイルをアップロードしてモーダルに表示
  const onFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        if (reader.result) {
          setImgSrc(reader.result.toString() || '')
          setOpened(true)
        }
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }, [])

  // 画像のZoomデフォルト値を設定
  const onMediaLoaded = useCallback((mediaSize: MediaSize) => {
    const { width, height } = mediaSize
    const mediaAspectRadio = width / height
    // 画像のアスペクト比が大きい(画像が横長)の場合
    if (mediaAspectRadio > ASPECT_RATIO) {
      // 縦幅に合わせてZoomのデフォルト値を指定
      const result = CROP_WIDTH / ASPECT_RATIO / height
      setZoom(result)
      setMinZoom(result)
      return
    }
    // 横幅に合わせてZoomのデフォルト値を指定
    const result = CROP_WIDTH / width
    setZoom(result)
    setMinZoom(result)
  }, [])

  // 画像の切り取り情報を更新
  // ユーザーが画像の移動やZoomの操作をやめたときに呼ばれる
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  // 切り取った画像のプレビューを表示
  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return
    try {
      const croppedImage = await getCroppedImg(imgSrc, croppedAreaPixels)
      setCroppedImgSrc(croppedImage)
      setOpened(false)
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, imgSrc])

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <div className='relative h-[220px] bg-gray-100'>
          <Cropper
            image={imgSrc}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={minZoom + 3}
            aspect={ASPECT_RATIO}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropSize={{
              width: CROP_WIDTH,
              height: CROP_WIDTH / ASPECT_RATIO,
            }}
            onMediaLoaded={onMediaLoaded}
            showGrid={false}
            cropShape='round'
          />
        </div>
        <div className='mx-8 mt-4'>
          <div className='ml-1'>Zoom</div>
          <Slider
            size='lg'
            value={zoom}
            onChange={setZoom}
            min={minZoom}
            max={minZoom + 3}
            step={0.1}
            label={null}
            marks={[
              { value: 1, label: '×1' },
              { value: 2.5, label: '×2.5' },
              { value: 4, label: '×4' },
            ]}
          />
        </div>
        <div className='mt-12 flex justify-around'>
          <Button color='red' onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button onClick={showCroppedImage}>OK</Button>
        </div>
      </Modal>
      <div className='relative'>
        <img
          src={croppedImgSrc ? croppedImgSrc : '/sample.jpg'}
          alt='アイコンの描画に失敗しました。'
          className='h-20 w-20 rounded-full sm:h-24 sm:w-24'
        />
        <label htmlFor='iconURL' className='absolute left-14 sm:left-16'>
          <input
            id='iconURL'
            type='file'
            accept='image/*,.png,.jpg,.jpeg,.gif'
            onChange={(e) => onFileChange(e)}
            className='hidden'
          />
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 sm:h-8 sm:w-8'>
            <Plus size={20} strokeWidth={3} color={'white'} />
          </div>
        </label>
      </div>
      {imgSrc ? <img src={imgSrc} alt='hoge' className='w-32' /> : null}
      {croppedImgSrc ? (
        <img src={croppedImgSrc} alt='hoge' className='w-32' />
      ) : null}
    </>
  )
}

export default TrimmingImg
